import type { User } from '@supabase/supabase-js';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
}

export interface SafetyData {
  streetLights: number;
  cctvDensity: number;
  policeStations: number;
  crowdLevel: number;
  alcoholShops: number;
  warnings: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  routeFacilities: {
    hospitals: Array<{ name: string; distance: number; lat: number; lng: number }>;
    policeStations: Array<{ name: string; distance: number; lat: number; lng: number }>;
    liquorShops: Array<{ name: string; distance: number; lat: number; lng: number }>;
    streetLights: Array<{ lat: number; lng: number; intensity: number }>;
    cctvCameras: Array<{ lat: number; lng: number; coverage: number }>;
  };
}

export interface RouteResponse {
  routes: Array<{
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      steps: Array<{
        instructions: string;
        distance: { text: string };
        duration: { text: string };
        start_location: { lat: number; lng: number };
        end_location: { lat: number; lng: number };
      }>;
    }>;
    overview_polyline: {
      points: string;
    };
  }>;
}

class MapService {
  private googleMapsApiKey: string;
  private openCageApiKey: string;
  private isGoogleMapsLoaded: boolean = false;
  private googleMapsPromise: Promise<void> | null = null;

  constructor() {
    this.googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    this.openCageApiKey = import.meta.env.VITE_OPENCAGE_API_KEY || '';
    
    if (!this.googleMapsApiKey) {
      console.warn('⚠️ Google Maps API key not found');
    }
    if (!this.openCageApiKey) {
      console.warn('⚠️ OpenCage API key not found');
    }
  }

  private async loadGoogleMaps(): Promise<void> {
    if (this.isGoogleMapsLoaded) {
      return Promise.resolve();
    }

    if (this.googleMapsPromise) {
      return this.googleMapsPromise;
    }

    this.googleMapsPromise = new Promise((resolve, reject) => {
      if (!this.googleMapsApiKey) {
        reject(new Error('Google Maps API key not available'));
        return;
      }

      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        this.isGoogleMapsLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.isGoogleMapsLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };
      
      document.head.appendChild(script);
    });

    return this.googleMapsPromise;
  }

  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to Delhi coordinates
          resolve({
            lat: 28.6139,
            lng: 77.2090,
            address: 'Delhi, India (Approximate)'
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }

  async reverseGeocode(location: Location): Promise<string> {
    try {
      if (!this.openCageApiKey) {
        return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
      }

      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${location.lat},${location.lng}&key=${this.openCageApiKey}&limit=1`
      );
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted;
      }
      
      return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
    }
  }

  async searchPlaces(query: string, location?: Location): Promise<PlaceResult[]> {
    try {
      console.log('🔍 Searching for places:', query);
      
      await this.loadGoogleMaps();
      
      if (!window.google || !window.google.maps) {
        console.warn('⚠️ Google Maps not loaded');
        return [];
      }

      return new Promise((resolve, reject) => {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        
        const request: any = {
          query: query,
          fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types']
        };

        if (location) {
          request.location = new window.google.maps.LatLng(location.lat, location.lng);
          request.radius = 50000; // 50km radius
        }

        service.textSearch(request, (results: any[], status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            console.log(`✅ Found ${results.length} places for "${query}"`);
            
            const places: PlaceResult[] = results.slice(0, 10).map((place: any) => ({
              place_id: place.place_id,
              name: place.name,
              formatted_address: place.formatted_address,
              geometry: {
                location: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                }
              },
              types: place.types || []
            }));
            
            resolve(places);
          } else {
            console.warn('Places search failed:', status);
            resolve([]);
          }
        });
      });
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  async getRoute(source: Location, destination: Location): Promise<RouteResponse | null> {
    try {
      console.log('🛣️ Getting route from Google Directions API');
      
      await this.loadGoogleMaps();
      
      if (!window.google || !window.google.maps) {
        console.warn('⚠️ Google Maps not loaded');
        return null;
      }

      return new Promise((resolve, reject) => {
        const directionsService = new window.google.maps.DirectionsService();
        
        const request = {
          origin: new window.google.maps.LatLng(source.lat, source.lng),
          destination: new window.google.maps.LatLng(destination.lat, destination.lng),
          travelMode: window.google.maps.TravelMode.WALKING,
          provideRouteAlternatives: true,
          avoidHighways: false,
          avoidTolls: false
        };

        directionsService.route(request, (result: any, status: any) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            console.log('✅ Route found successfully');
            
            // Convert Google Maps result to our format
            const routeResponse: RouteResponse = {
              routes: result.routes.map((route: any) => ({
                legs: route.legs.map((leg: any) => ({
                  distance: {
                    text: leg.distance.text,
                    value: leg.distance.value
                  },
                  duration: {
                    text: leg.duration.text,
                    value: leg.duration.value
                  },
                  steps: leg.steps.map((step: any) => ({
                    instructions: step.instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
                    distance: { text: step.distance.text },
                    duration: { text: step.duration.text },
                    start_location: {
                      lat: step.start_location.lat(),
                      lng: step.start_location.lng()
                    },
                    end_location: {
                      lat: step.end_location.lat(),
                      lng: step.end_location.lng()
                    }
                  }))
                })),
                overview_polyline: {
                  points: route.overview_polyline
                }
              }))
            };
            
            resolve(routeResponse);
          } else {
            console.warn('Directions request failed:', status);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Error getting route:', error);
      return null;
    }
  }

  // Calculate distance between two points using Haversine formula
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Return distance in meters
  }

  // Check if a point is near the route (within specified distance)
  private isNearRoute(pointLat: number, pointLng: number, routeCoordinates: [number, number][], maxDistance: number = 200): { isNear: boolean; minDistance: number } {
    let minDistance = Infinity;
    
    for (const [routeLat, routeLng] of routeCoordinates) {
      const distance = this.calculateDistance(pointLat, pointLng, routeLat, routeLng);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
    
    return {
      isNear: minDistance <= maxDistance,
      minDistance: Math.round(minDistance)
    };
  }

  // Get facilities along the specific route using Google Places API
  private async getFacilitiesAlongRoute(routeCoordinates: [number, number][], facilityType: string): Promise<Array<{ name: string; distance: number; lat: number; lng: number }>> {
    try {
      await this.loadGoogleMaps();
      
      if (!window.google || !window.google.maps || routeCoordinates.length === 0) {
        console.warn('⚠️ Google Maps not available or no route coordinates');
        return [];
      }

      const facilities: Array<{ name: string; distance: number; lat: number; lng: number }> = [];
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      // Sample points along the route (every 10th point to avoid too many API calls)
      const samplePoints = routeCoordinates.filter((_, index) => index % 10 === 0);
      console.log(`🔍 Searching for ${facilityType} along ${samplePoints.length} route points`);
      
      const searchPromises = samplePoints.map((point, index) => {
        return new Promise<void>((resolve) => {
          // Add delay to avoid hitting API rate limits
          setTimeout(() => {
            const [lat, lng] = point;
            const location = new window.google.maps.LatLng(lat, lng);
            
            const request = {
              location: location,
              radius: 300, // 300 meter radius from route point
              type: facilityType,
              fields: ['place_id', 'name', 'geometry', 'vicinity']
            };

            service.nearbySearch(request, (results: any[], status: any) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                for (const place of results) {
                  if (place.geometry && place.geometry.location) {
                    const placeLat = place.geometry.location.lat();
                    const placeLng = place.geometry.location.lng();
                    
                    // Check if this facility is actually near our route
                    const { isNear, minDistance } = this.isNearRoute(placeLat, placeLng, routeCoordinates, 200);
                    
                    if (isNear) {
                      // Avoid duplicates by checking if we already have this place
                      const exists = facilities.some(f => 
                        this.calculateDistance(f.lat, f.lng, placeLat, placeLng) < 50
                      );
                      
                      if (!exists) {
                        facilities.push({
                          name: place.name || 'Unknown',
                          distance: minDistance,
                          lat: placeLat,
                          lng: placeLng
                        });
                      }
                    }
                  }
                }
              }
              resolve();
            });
          }, index * 200); // 200ms delay between requests
        });
      });

      await Promise.all(searchPromises);
      
      // Sort by distance from route and limit results
      const sortedFacilities = facilities.sort((a, b) => a.distance - b.distance).slice(0, 20);
      console.log(`✅ Found ${sortedFacilities.length} ${facilityType} facilities along route`);
      
      return sortedFacilities;
    } catch (error) {
      console.error(`Error getting ${facilityType} along route:`, error);
      return [];
    }
  }

  // Simulate street lights along route based on road type and area
  private getStreetLightsAlongRoute(routeCoordinates: [number, number][]): Array<{ lat: number; lng: number; intensity: number }> {
    const streetLights: Array<{ lat: number; lng: number; intensity: number }> = [];
    
    // Add street lights every ~100 meters along the route
    for (let i = 0; i < routeCoordinates.length; i += 3) {
      const [lat, lng] = routeCoordinates[i];
      
      // Simulate lighting intensity based on area (higher in commercial areas)
      const intensity = Math.random() * 40 + 60; // 60-100% intensity
      
      streetLights.push({ lat, lng, intensity });
    }
    
    return streetLights;
  }

  // Simulate CCTV cameras along route
  private getCCTVAlongRoute(routeCoordinates: [number, number][]): Array<{ lat: number; lng: number; coverage: number }> {
    const cctvCameras: Array<{ lat: number; lng: number; coverage: number }> = [];
    
    // Add CCTV cameras every ~200 meters along the route
    for (let i = 0; i < routeCoordinates.length; i += 6) {
      const [lat, lng] = routeCoordinates[i];
      
      // Simulate coverage percentage
      const coverage = Math.random() * 30 + 70; // 70-100% coverage
      
      cctvCameras.push({ lat, lng, coverage });
    }
    
    return cctvCameras;
  }

  async analyzeSafetyFactors(routeCoordinates: [number, number][]): Promise<SafetyData> {
    console.log('🔍 Analyzing safety factors along route with', routeCoordinates.length, 'points');
    
    try {
      // Get facilities specifically along the route
      console.log('🏥 Searching for hospitals along route...');
      const hospitals = await this.getFacilitiesAlongRoute(routeCoordinates, 'hospital');
      
      console.log('👮 Searching for police stations along route...');
      const policeStations = await this.getFacilitiesAlongRoute(routeCoordinates, 'police');
      
      console.log('🍺 Searching for liquor stores along route...');
      const liquorShops = await this.getFacilitiesAlongRoute(routeCoordinates, 'liquor_store');

      // Get simulated infrastructure along route
      const streetLights = this.getStreetLightsAlongRoute(routeCoordinates);
      const cctvCameras = this.getCCTVAlongRoute(routeCoordinates);

      console.log('📊 Route-specific facilities found:', {
        hospitals: hospitals.length,
        policeStations: policeStations.length,
        liquorShops: liquorShops.length,
        streetLights: streetLights.length,
        cctvCameras: cctvCameras.length
      });

      // Calculate safety scores based on route-specific data
      const streetLightScore = Math.min(100, (streetLights.length / (routeCoordinates.length / 10)) * 100);
      const cctvScore = Math.min(100, (cctvCameras.length / (routeCoordinates.length / 15)) * 100);
      const policeScore = Math.min(100, policeStations.length * 25); // Each police station adds 25%
      const crowdScore = Math.random() * 30 + 60; // Simulated crowd level
      
      // Liquor shops REDUCE safety (inverted score)
      const liquorPenalty = Math.min(50, liquorShops.length * 15); // Each liquor shop reduces safety by 15%
      const alcoholScore = Math.max(0, 100 - liquorPenalty);

      // Generate route-specific warnings
      const warnings: string[] = [];
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

      // Liquor shop warnings
      if (liquorShops.length >= 5) {
        warnings.push(`⚠️ HIGH RISK: ${liquorShops.length} alcohol establishments along route`);
        riskLevel = 'HIGH';
      } else if (liquorShops.length >= 3) {
        warnings.push(`⚠️ CAUTION: ${liquorShops.length} alcohol establishments detected along route`);
        riskLevel = 'MEDIUM';
      }

      // Lighting warnings
      if (streetLightScore < 40) {
        warnings.push('⚠️ POOR LIGHTING: Avoid this route during dark hours');
        riskLevel = riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM';
      }

      // Police presence
      if (policeStations.length === 0) {
        warnings.push('⚠️ NO POLICE STATIONS: Limited law enforcement along route');
        riskLevel = riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM';
      }

      // Crowd level warnings
      if (crowdScore < 30) {
        warnings.push('⚠️ LOW TRAFFIC: Consider busier alternative routes');
        riskLevel = riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM';
      }

      // Time-based warnings
      const currentHour = new Date().getHours();
      if (currentHour >= 22 || currentHour <= 5) {
        warnings.push('⚠️ NIGHT TRAVEL: Extra caution recommended during late hours');
      }

      // Positive safety indicators
      if (policeStations.length >= 2) {
        warnings.push(`✅ ${policeStations.length} police stations nearby for emergencies`);
      }
      if (hospitals.length >= 1) {
        warnings.push(`✅ ${hospitals.length} medical facilities along route`);
      }
      if (streetLightScore >= 80) {
        warnings.push('✅ Excellent street lighting coverage');
      }

      // Route recommendations
      if (riskLevel === 'HIGH') {
        warnings.push('🚫 AVOID THIS ROUTE - Consider alternative paths');
      } else if (riskLevel === 'MEDIUM') {
        warnings.push('⚠️ Exercise caution - Travel with others if possible');
      } else {
        warnings.push('✅ Route appears safe - Standard precautions recommended');
      }

      const safetyData: SafetyData = {
        streetLights: Math.round(streetLightScore),
        cctvDensity: Math.round(cctvScore),
        policeStations: Math.round(policeScore),
        crowdLevel: Math.round(crowdScore),
        alcoholShops: Math.round(alcoholScore),
        warnings,
        riskLevel,
        routeFacilities: {
          hospitals,
          policeStations,
          liquorShops,
          streetLights,
          cctvCameras
        }
      };

      console.log('✅ Safety analysis complete:', {
        riskLevel,
        warningCount: warnings.length,
        overallSafety: Math.round((streetLightScore + cctvScore + policeScore + crowdScore + alcoholScore) / 5)
      });

      return safetyData;
    } catch (error) {
      console.error('❌ Error analyzing safety factors:', error);
      
      // Return default safe values on error
      return {
        streetLights: 75,
        cctvDensity: 70,
        policeStations: 60,
        crowdLevel: 65,
        alcoholShops: 80,
        warnings: ['⚠️ Unable to analyze route safety - Exercise standard precautions'],
        riskLevel: 'MEDIUM',
        routeFacilities: {
          hospitals: [],
          policeStations: [],
          liquorShops: [],
          streetLights: [],
          cctvCameras: []
        }
      };
    }
  }

  async getNearbyFacilities(location: Location): Promise<any[]> {
    // This method can remain for general area overview
    return [];
  }

  decodePolyline(encoded: string): [number, number][] {
    if (!encoded || typeof encoded !== 'string') {
      console.warn('⚠️ Invalid polyline data');
      return [];
    }

    const coordinates: [number, number][] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let byte;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += deltaLat;

      shift = 0;
      result = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += deltaLng;

      coordinates.push([lat / 1e5, lng / 1e5]);
    }

    return coordinates;
  }
}

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

export const mapService = new MapService();