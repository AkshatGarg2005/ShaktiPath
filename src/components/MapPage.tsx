import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Navigation, MapPin, Shield, Clock, AlertTriangle, CheckCircle, Eye, Lightbulb, Users, Phone, Menu, X, LogOut, User, Settings, Loader, History, Search, Target, Info, AlertCircle, Guitar as Hospital, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { mapService, type Location, type PlaceResult, type SafetyData } from '../services/mapService';
import { supabase } from '../lib/supabase';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different facility types
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
      <span style="color: white; font-size: 12px;">${icon}</span>
    </div>`,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const hospitalIcon = createCustomIcon('#ef4444', '🏥');
const policeIcon = createCustomIcon('#3b82f6', '👮');
const liquorIcon = createCustomIcon('#f59e0b', '🍺');

interface RouteData {
  coordinates: [number, number][];
  distance: string;
  duration: string;
  safetyScore: number;
  safetyFactors: SafetyData;
  steps: Array<{
    instructions: string;
    distance: string;
    duration: string;
  }>;
}

function MapPage() {
  const { user, logout } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [source, setSource] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [sourceInput, setSourceInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [route, setRoute] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState<'source' | 'destination' | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [nearbyFacilities, setNearbyFacilities] = useState<any[]>([]);
  const [routeHistory, setRouteHistory] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSendingSOS, setIsSendingSOS] = useState(false);
  const [sosError, setSosError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);

  // Get current location on component mount
  useEffect(() => {
    initializeLocation();
    loadRouteHistory();
  }, []);

  const initializeLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await mapService.getCurrentLocation();
      setCurrentLocation(location);
      setSource(location);
      
      const address = await mapService.reverseGeocode(location);
      setSourceInput(address);
      
      // Get nearby safety facilities
      const facilities = await mapService.getNearbyFacilities(location);
      setNearbyFacilities(facilities);
    } catch (error) {
      console.error('Error initializing location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const loadRouteHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('route_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error loading route history:', error);
      } else {
        setRouteHistory(data || []);
      }
    } catch (error) {
      console.error('Error loading route history:', error);
    }
  };

  const saveRouteToHistory = async (routeData: RouteData) => {
    if (!user || !source || !destination) return;

    try {
      const { error } = await supabase
        .from('route_history')
        .insert([
          {
            user_id: user.id,
            source_lat: source.lat,
            source_lng: source.lng,
            source_address: sourceInput,
            destination_lat: destination.lat,
            destination_lng: destination.lng,
            destination_address: destinationInput,
            safety_score: routeData.safetyScore,
            distance: routeData.distance,
            duration: routeData.duration,
            route_data: {
              coordinates: routeData.coordinates,
              safetyFactors: routeData.safetyFactors,
              steps: routeData.steps
            }
          }
        ]);

      if (error) {
        console.error('Error saving route:', error);
      } else {
        loadRouteHistory(); // Refresh history
      }
    } catch (error) {
      console.error('Error saving route:', error);
    }
  };

  const searchPlaces = async (query: string, type: 'source' | 'destination') => {
    if (query.length < 2) {
      setSuggestions([]);
      setActiveSuggestion(null);
      setSearchError(null);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debouncing
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      
      try {
        console.log(`🔍 Searching for: "${query}" (${type})`);
        const results = await mapService.searchPlaces(query, currentLocation || undefined);
        console.log(`📍 Found ${results.length} results:`, results);
        
        if (results.length === 0) {
          setSearchError(`No results found for "${query}". Try searching with city names like "Khan Market Delhi" or "Connaught Place Delhi".`);
        } else {
          setSearchError(null);
        }
        
        setSuggestions(results);
        setActiveSuggestion(type);
      } catch (error: any) {
        console.error('Error searching places:', error);
        setSearchError('Search failed. Please try again with a different query.');
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce
  };

  const handlePlaceSelect = (place: PlaceResult, type: 'source' | 'destination') => {
    console.log(`📍 Selected place:`, place);
    
    const location: Location = {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      address: place.formatted_address
    };

    if (type === 'source') {
      setSource(location);
      setSourceInput(place.formatted_address);
    } else {
      setDestination(location);
      setDestinationInput(place.formatted_address);
    }

    setSuggestions([]);
    setActiveSuggestion(null);
    setSearchError(null);
  };

  const handleInputChange = (value: string, type: 'source' | 'destination') => {
    if (type === 'source') {
      setSourceInput(value);
    } else {
      setDestinationInput(value);
    }
    
    searchPlaces(value, type);
  };

  const handleInputFocus = (type: 'source' | 'destination') => {
    const query = type === 'source' ? sourceInput : destinationInput;
    if (query.length >= 2) {
      searchPlaces(query, type);
    }
  };

  const handleInputBlur = (type: 'source' | 'destination') => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      if (activeSuggestion === type) {
        setSuggestions([]);
        setActiveSuggestion(null);
        setSearchError(null);
      }
    }, 200);
  };

  const useCurrentLocation = () => {
    if (currentLocation) {
      setSource(currentLocation);
      setSourceInput('Current Location');
      setSuggestions([]);
      setActiveSuggestion(null);
    }
  };

  const swapLocations = () => {
    if (source && destination) {
      const tempSource = source;
      const tempSourceInput = sourceInput;
      
      setSource(destination);
      setSourceInput(destinationInput);
      setDestination(tempSource);
      setDestinationInput(tempSourceInput);
    }
  };

  const calculateSafeRoute = async () => {
    if (!source || !destination) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('🛣️ Starting route calculation...');
      console.log('📍 Source:', source);
      console.log('📍 Destination:', destination);
      
      // Get route from mapping service
      const routeResponse = await mapService.getRoute(source, destination);
      
      if (!routeResponse || !routeResponse.routes.length) {
        throw new Error('No route found');
      }

      console.log('✅ Route response received:', routeResponse);
      
      const routeData = routeResponse.routes[0];
      const leg = routeData.legs[0];
      
      console.log('📊 Route leg data:', leg);
      console.log('🔗 Overview polyline:', routeData.overview_polyline?.points?.substring(0, 50) + '...');
      
      // Decode polyline to get route coordinates
      let coordinates: [number, number][] = [];
      
      if (routeData.overview_polyline?.points) {
        console.log('🔄 Decoding polyline...');
        coordinates = mapService.decodePolyline(routeData.overview_polyline.points);
        console.log(`✅ Decoded ${coordinates.length} coordinate points`);
        console.log('📍 First few coordinates:', coordinates.slice(0, 3));
        console.log('📍 Last few coordinates:', coordinates.slice(-3));
      } else {
        console.warn('⚠️ No polyline found, using direct coordinates');
        coordinates = [[source.lat, source.lng], [destination.lat, destination.lng]];
      }

      // If we still have too few points, enhance the route
      if (coordinates.length < 5) {
        console.log('🔄 Enhancing route with additional waypoints...');
        coordinates = generateEnhancedRoute(source, destination, coordinates);
        console.log(`✅ Enhanced route now has ${coordinates.length} points`);
      }

      // Analyze safety factors along the specific route
      console.log('🔍 Analyzing safety factors along the specific route...');
      const safetyFactors = await mapService.analyzeSafetyFactors(coordinates);
      
      // Calculate overall safety score
      const safetyScore = Math.round(
        (safetyFactors.streetLights + 
         safetyFactors.cctvDensity + 
         safetyFactors.policeStations + 
         safetyFactors.crowdLevel + 
         safetyFactors.alcoholShops) / 5
      );

      // Extract step-by-step instructions
      const steps = leg.steps?.map(step => ({
        instructions: step.instructions || 'Continue',
        distance: step.distance?.text || '0 m',
        duration: step.duration?.text || '0 mins'
      })) || [];

      const routeInfo: RouteData = {
        coordinates,
        distance: leg.distance?.text || '0 km',
        duration: leg.duration?.text || '0 mins',
        safetyScore,
        safetyFactors,
        steps
      };

      console.log('✅ Final route data:', {
        coordinateCount: routeInfo.coordinates.length,
        distance: routeInfo.distance,
        duration: routeInfo.duration,
        safetyScore: routeInfo.safetyScore,
        stepCount: routeInfo.steps.length,
        facilitiesAlongRoute: {
          hospitals: routeInfo.safetyFactors.routeFacilities.hospitals.length,
          policeStations: routeInfo.safetyFactors.routeFacilities.policeStations.length,
          liquorShops: routeInfo.safetyFactors.routeFacilities.liquorShops.length
        }
      });

      setRoute(routeInfo);
      
      // Save route to history
      await saveRouteToHistory(routeInfo);
      
      // Fit map to show the route
      if (mapRef.current && coordinates.length > 0) {
        console.log('🗺️ Fitting map to route bounds...');
        const bounds = L.latLngBounds(coordinates);
        mapRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
      
    } catch (error: any) {
      console.error('❌ Error calculating route:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate enhanced route with more waypoints for smoother curves
  const generateEnhancedRoute = (source: Location, destination: Location, existingCoords: [number, number][]): [number, number][] => {
    if (existingCoords.length >= 5) return existingCoords;
    
    console.log('🔄 Generating enhanced route with realistic waypoints...');
    
    const numPoints = 15; // Generate 15 waypoints for smooth curves
    const enhanced: [number, number][] = [];
    
    // Add source
    enhanced.push([source.lat, source.lng]);
    
    // Generate intermediate points with realistic road-like curves
    for (let i = 1; i < numPoints - 1; i++) {
      const ratio = i / (numPoints - 1);
      
      // Base interpolation
      let lat = source.lat + (destination.lat - source.lat) * ratio;
      let lng = source.lng + (destination.lng - source.lng) * ratio;
      
      // Add realistic road curves
      const curveIntensity = 0.002; // Adjust for more/less curvature
      const frequency = 2.5; // Number of curves along the route
      
      // Create natural S-curves
      const curveOffset = Math.sin(ratio * Math.PI * frequency) * curveIntensity * Math.sin(ratio * Math.PI);
      const perpendicularAngle = Math.atan2(destination.lng - source.lng, destination.lat - source.lat) + Math.PI / 2;
      
      lat += Math.cos(perpendicularAngle) * curveOffset;
      lng += Math.sin(perpendicularAngle) * curveOffset;
      
      // Add slight randomness for more realistic paths
      const randomOffset = 0.0003;
      lat += (Math.random() - 0.5) * randomOffset;
      lng += (Math.random() - 0.5) * randomOffset;
      
      // Simulate road grid alignment
      if (Math.random() < 0.4) {
        const gridSize = 0.001;
        lat = Math.round(lat / gridSize) * gridSize;
        lng = Math.round(lng / gridSize) * gridSize;
      }
      
      enhanced.push([lat, lng]);
    }
    
    // Add destination
    enhanced.push([destination.lat, destination.lng]);
    
    console.log(`✅ Generated ${enhanced.length} enhanced waypoints`);
    return enhanced;
  };

  const getSafetyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSafetyBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getRouteColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const sendSOSAlert = async () => {
  if (!currentLocation || !user) {
    setSosError('Location or user not available');
    return;
  }

  setIsSendingSOS(true);
  setSosError(null);

  try {
    console.log('🚨 Sending SOS alert…');

    // ── 1. Reverse-geocode current location ──────────────────────────────
    const currentAddress = await mapService.reverseGeocode(currentLocation);

    // ── 2. Persist alert (non-blocking) ──────────────────────────────────
    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .insert([
          {
            user_id: user.id,
            lat: currentLocation.lat,
            lng: currentLocation.lng,
            address: currentAddress,
            alert_type: 'sos',
            status: 'active',
          },
        ]);
      if (error) console.error('Error saving emergency alert:', error);
      else console.log('✅ Emergency alert saved to database');
    } catch (dbError) {
      console.error('Database error (non-blocking):', dbError);
    }

    // ── 3. Normalise emergency number (India default) ────────────────────
    let emergencyNumber = user.emergency_contact;
    if (emergencyNumber) {
      emergencyNumber = emergencyNumber.replace(/\D/g, '');
      if (emergencyNumber.length === 10) emergencyNumber = '91' + emergencyNumber;
      else if (emergencyNumber.startsWith('+91')) emergencyNumber = emergencyNumber.substring(1);
    }

    // ── 4. Construct WhatsApp message ────────────────────────────────────
    const now = new Date();
    const indianTime = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(now);

    const locationString = `${currentLocation.lat},${currentLocation.lng}`;
    const googleMapsLink = `https://maps.google.com/?q=${locationString}`;

    const message = `🚨 EMERGENCY ALERT from ${user.full_name}

📍 Location: ${currentAddress}

🗺️ Google Maps: ${googleMapsLink}

📞 Contact: ${user.phone}
⏰ Time: ${indianTime}

🆘 Please respond immediately! I need help.

Sent via ShaktiPath Safety App`;

    // ── 5. Attempt to open WhatsApp in a new tab ─────────────────────────
    const whatsappUrl = `https://wa.me/${emergencyNumber}?text=${encodeURIComponent(message)}`;
    console.log('📱 Opening WhatsApp:', whatsappUrl);

    const popup = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    // If popup is blocked the function simply ends; no UI messages
    if (popup && !popup.closed) {
      console.log('✅ WhatsApp opened in new tab/window');
    } else {
      console.warn('⚠️ Pop-up blocked by the browser (silent fallback)');
    }

    // Opening in the same tab ensures the user can navigate back
    // window.location.href = whatsappUrl;

  } catch (err) {
    console.error('❌ Error sending SOS alert:', err);
    setSosError('Failed to send emergency alert. Please contact your emergency contact directly.');
  } finally {
    setIsSendingSOS(false);
  }
};

  if (isLoadingLocation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ShaktiPath
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.full_name}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-4">
                <span className="text-gray-700">Welcome, {user?.full_name}</span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)] md:flex-row flex-col">
        {/* Desktop Sidebar / Mobile Bottom Panel */}
        <div className="w-full md:w-96 bg-white shadow-lg overflow-y-auto md:relative fixed bottom-0 left-0 right-0 z-[1101] md:z-auto max-h-[40vh] md:max-h-none">
          <div className="p-6">
            {/* Mobile SOS Button - Always Visible at Top */}
            <div className="md:hidden mb-6">
              <button
                onClick={sendSOSAlert}
                disabled={isSendingSOS}
                className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg"
              >
                {isSendingSOS ? (
                  <>
                    <Loader className="animate-spin h-6 w-6" />
                    <span>Sending SOS...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-6 w-6" />
                    <span>🚨 EMERGENCY SOS</span>
                  </>
                )}
              </button>
              
              {sosError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{sosError}</p>
                </div>
              )}
              
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-600">
                  Emergency Contact: {user?.emergency_contact}
                </p>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-6">Plan Your Safe Route</h1>
            
            {/* Location Inputs */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From (Source)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-green-500" />
                  <input
                    ref={sourceInputRef}
                    type="text"
                    value={sourceInput}
                    onChange={(e) => handleInputChange(e.target.value, 'source')}
                    onFocus={() => handleInputFocus('source')}
                    onBlur={() => handleInputBlur('source')}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter source location"
                  />
                  {isSearching && activeSuggestion === 'source' && (
                    <div className="absolute right-3 top-3">
                      <Loader className="h-5 w-5 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>
                
                {/* Current Location Button */}
                <button
                  onClick={useCurrentLocation}
                  className="mt-2 text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                >
                  <Target className="h-4 w-4" />
                  <span>Use current location</span>
                </button>
                
                {activeSuggestion === 'source' && suggestions.length > 0 && (
                  <div className="absolute z-[1102] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((place, index) => (
                      <button
                        key={place.place_id || index}
                        onMouseDown={(e) => e.preventDefault()} // Prevent blur
                        onClick={() => handlePlaceSelect(place, 'source')}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 focus:bg-gray-100 focus:outline-none"
                      >
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{place.name}</div>
                            <div className="text-sm text-gray-600 truncate">{place.formatted_address}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {activeSuggestion === 'source' && searchError && (
                  <div className="absolute z-[1102] w-full mt-1 bg-white border border-red-300 rounded-lg shadow-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-700">{searchError}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Swap Button */}
              {source && destination && (
                <div className="flex justify-center">
                  <button
                    onClick={swapLocations}
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                    title="Swap locations"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To (Destination)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-red-500" />
                  <input
                    ref={destinationInputRef}
                    type="text"
                    value={destinationInput}
                    onChange={(e) => handleInputChange(e.target.value, 'destination')}
                    onFocus={() => handleInputFocus('destination')}
                    onBlur={() => handleInputBlur('destination')}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter destination"
                  />
                  {isSearching && activeSuggestion === 'destination' && (
                    <div className="absolute right-3 top-3">
                      <Loader className="h-5 w-5 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>
                
                {activeSuggestion === 'destination' && suggestions.length > 0 && (
                  <div className="absolute z-[1102] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((place, index) => (
                      <button
                        key={place.place_id || index}
                        onMouseDown={(e) => e.preventDefault()} // Prevent blur
                        onClick={() => handlePlaceSelect(place, 'destination')}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 focus:bg-gray-100 focus:outline-none"
                      >
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{place.name}</div>
                            <div className="text-sm text-gray-600 truncate">{place.formatted_address}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {activeSuggestion === 'destination' && searchError && (
                  <div className="absolute z-[1102] w-full mt-1 bg-white border border-red-300 rounded-lg shadow-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-700">{searchError}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Calculate Route Button */}
            <button
              onClick={calculateSafeRoute}
              disabled={!source || !destination || isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin h-5 w-5" />
                  <span>Analyzing Route Safety...</span>
                </>
              ) : (
                <>
                  <Navigation className="h-5 w-5" />
                  <span>Find Safe Route</span>
                </>
              )}
            </button>

            {/* Desktop SOS Button - Always Visible */}
            <div className="hidden md:block mt-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="h-4 w-4 text-red-600" />
                  <h4 className="font-semibold text-red-800">Emergency Contact</h4>
                </div>
                <p className="text-sm text-red-700 mb-3">
                  Your emergency contact: {user?.emergency_contact}
                </p>
                <button 
                  onClick={sendSOSAlert}
                  disabled={isSendingSOS}
                  className="w-full bg-red-600 text-white px-4 py-3 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSendingSOS ? (
                    <>
                      <Loader className="animate-spin h-4 w-4" />
                      <span>Sending SOS...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      <span>🚨 Send SOS Alert</span>
                    </>
                  )}
                </button>
                
                {sosError && (
                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700">
                    {sosError}
                  </div>
                )}
              </div>
            </div>

            {/* Route Information */}
            {route && (
              <div className="mt-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Route Summary</h3>
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSafetyBgColor(route.safetyScore)} ${getSafetyColor(route.safetyScore)}`}>
                        {route.safetyScore}% Safe
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(route.safetyFactors.riskLevel)}`}>
                        {route.safetyFactors.riskLevel} RISK
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{route.distance}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{route.duration}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600">
                    Route analyzed: {route.coordinates.length} waypoints
                  </div>
                </div>

                {/* Route-Specific Facilities */}
                {(route.safetyFactors.routeFacilities.hospitals.length > 0 || 
                  route.safetyFactors.routeFacilities.policeStations.length > 0 || 
                  route.safetyFactors.routeFacilities.liquorShops.length > 0) && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Facilities Along Route</h4>
                    <div className="space-y-2">
                      {route.safetyFactors.routeFacilities.hospitals.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Hospital className="h-4 w-4 text-red-500" />
                            <span>Hospitals</span>
                          </div>
                          <span className="font-medium text-green-600">
                            {route.safetyFactors.routeFacilities.hospitals.length} found
                          </span>
                        </div>
                      )}
                      
                      {route.safetyFactors.routeFacilities.policeStations.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            <span>Police Stations</span>
                          </div>
                          <span className="font-medium text-green-600">
                            {route.safetyFactors.routeFacilities.policeStations.length} found
                          </span>
                        </div>
                      )}
                      
                      {route.safetyFactors.routeFacilities.liquorShops.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-orange-500" />
                            <span>Liquor Shops</span>
                          </div>
                          <span className="font-medium text-red-600">
                            {route.safetyFactors.routeFacilities.liquorShops.length} detected
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Safety Factors */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Safety Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Street Lighting</span>
                      </div>
                      <span className={`text-sm font-medium ${getSafetyColor(route.safetyFactors.streetLights)}`}>
                        {route.safetyFactors.streetLights}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">CCTV Coverage</span>
                      </div>
                      <span className={`text-sm font-medium ${getSafetyColor(route.safetyFactors.cctvDensity)}`}>
                        {route.safetyFactors.cctvDensity}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Police Presence</span>
                      </div>
                      <span className={`text-sm font-medium ${getSafetyColor(route.safetyFactors.policeStations)}`}>
                        {route.safetyFactors.policeStations}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Crowd Level</span>
                      </div>
                      <span className={`text-sm font-medium ${getSafetyColor(route.safetyFactors.crowdLevel)}`}>
                        {route.safetyFactors.crowdLevel}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">Alcohol Avoidance</span>
                      </div>
                      <span className={`text-sm font-medium ${getSafetyColor(route.safetyFactors.alcoholShops)}`}>
                        {route.safetyFactors.alcoholShops}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Safety Warnings and Recommendations */}
                {route.safetyFactors.warnings.length > 0 && (
                  <div className={`border rounded-lg p-4 ${
                    route.safetyFactors.riskLevel === 'HIGH' ? 'bg-red-50 border-red-200' :
                    route.safetyFactors.riskLevel === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className={`h-4 w-4 ${
                        route.safetyFactors.riskLevel === 'HIGH' ? 'text-red-600' :
                        route.safetyFactors.riskLevel === 'MEDIUM' ? 'text-yellow-600' :
                        'text-green-600'
                      }`} />
                      <h4 className={`font-semibold ${
                        route.safetyFactors.riskLevel === 'HIGH' ? 'text-red-800' :
                        route.safetyFactors.riskLevel === 'MEDIUM' ? 'text-yellow-800' :
                        'text-green-800'
                      }`}>
                        Route Safety Analysis
                      </h4>
                    </div>
                    <ul className="space-y-1">
                      {route.safetyFactors.warnings.map((warning, index) => (
                        <li key={index} className={`text-sm ${
                          route.safetyFactors.riskLevel === 'HIGH' ? 'text-red-700' :
                          route.safetyFactors.riskLevel === 'MEDIUM' ? 'text-yellow-700' :
                          'text-green-700'
                        }`}>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Turn-by-Turn Instructions */}
                {route.steps && route.steps.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Turn-by-Turn Directions</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {route.steps.slice(0, 8).map((step, index) => (
                        <div key={index} className="flex items-start space-x-3 text-sm">
                          <div className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-gray-900">{step.instructions}</div>
                            <div className="text-gray-500 text-xs">{step.distance} • {step.duration}</div>
                          </div>
                        </div>
                      ))}
                      {route.steps.length > 8 && (
                        <div className="text-xs text-gray-500 text-center pt-2">
                          ... and {route.steps.length - 8} more steps
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Route History */}
            {routeHistory.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <History className="h-4 w-4 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">Recent Routes</h4>
                </div>
                <div className="space-y-2">
                  {routeHistory.slice(0, 3).map((route, index) => (
                    <div key={route.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                      <div className="font-medium text-gray-900 truncate">
                        {route.destination_address}
                      </div>
                      <div className="text-gray-600 text-xs mt-1">
                        {route.distance} • {route.duration} • {route.safety_score}% safe
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative md:static mobile-map-container">
          {currentLocation ? (
            <MapContainer
              center={[currentLocation.lat, currentLocation.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Current Location Marker */}
              {currentLocation && (
                <Marker position={[currentLocation.lat, currentLocation.lng]}>
                  <Popup>Your Current Location</Popup>
                </Marker>
              )}
              
              {/* Source Marker */}
              {source && source !== currentLocation && (
                <Marker position={[source.lat, source.lng]}>
                  <Popup>Source: {sourceInput}</Popup>
                </Marker>
              )}
              
              {/* Destination Marker */}
              {destination && (
                <Marker position={[destination.lat, destination.lng]}>
                  <Popup>Destination: {destinationInput}</Popup>
                </Marker>
              )}
              
              {/* Route Polyline with Enhanced Display */}
              {route && route.coordinates.length > 0 && (
                <>
                  <Polyline
                    positions={route.coordinates}
                    color={getRouteColor(route.safetyScore)}
                    weight={6}
                    opacity={0.8}
                    smoothFactor={1}
                  />
                  {/* Add a subtle shadow effect */}
                  <Polyline
                    positions={route.coordinates}
                    color="#000000"
                    weight={8}
                    opacity={0.2}
                    smoothFactor={1}
                  />
                </>
              )}
              
              {/* Route-Specific Facility Markers */}
              {route && (
                <>
                  {/* Hospitals along route */}
                  {route.safetyFactors.routeFacilities.hospitals.map((hospital, index) => (
                    <Marker
                      key={`hospital-${index}`}
                      position={[hospital.lat, hospital.lng]}
                      icon={hospitalIcon}
                    >
                      <Popup>
                        <div>
                          <strong>{hospital.name}</strong><br />
                          <span className="text-sm text-gray-600">Hospital</span><br />
                          <span className="text-xs text-gray-500">{hospital.distance}m from route</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  
                  {/* Police stations along route */}
                  {route.safetyFactors.routeFacilities.policeStations.map((station, index) => (
                    <Marker
                      key={`police-${index}`}
                      position={[station.lat, station.lng]}
                      icon={policeIcon}
                    >
                      <Popup>
                        <div>
                          <strong>{station.name}</strong><br />
                          <span className="text-sm text-gray-600">Police Station</span><br />
                          <span className="text-xs text-gray-500">{station.distance}m from route</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  
                  {/* Liquor shops along route */}
                  {route.safetyFactors.routeFacilities.liquorShops.map((shop, index) => (
                    <Marker
                      key={`liquor-${index}`}
                      position={[shop.lat, shop.lng]}
                      icon={liquorIcon}
                    >
                      <Popup>
                        <div>
                          <strong>{shop.name}</strong><br />
                          <span className="text-sm text-orange-600">Liquor Store</span><br />
                          <span className="text-xs text-gray-500">{shop.distance}m from route</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </>
              )}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapPage;