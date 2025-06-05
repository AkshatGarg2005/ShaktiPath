import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Navigation, Clock, MapPin, Shield, Building, Wine, AlertTriangle } from 'lucide-react';
import LocationSearch from '../components/map/LocationSearch';
import RouteLayer from '../components/map/RouteLayer';
import SafetyLegend from '../components/map/SafetyLegend';
import MapControls from '../components/map/MapControls';
import TimePicker from '../components/map/TimePicker';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { fetchSafeRoute } from '../services/routeService';
import { fetchPOIs } from '../services/poiService';
import type { Location, POICategory, Route, POI } from '../types';
import { defaultIcon } from '../utils/leafletIcons';

const MapPage: React.FC = () => {
  const [source, setSource] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [route, setRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [center, setCenter] = useState<[number, number]>([12.9716, 77.5946]); // Bangalore center
  const [zoom, setZoom] = useState(12);
  const [activePOIs, setActivePOIs] = useState<{
    police: boolean;
    hospitals: boolean;
    liquorShops: boolean;
    crimeZones: boolean;
  }>({
    police: false,
    hospitals: false,
    liquorShops: false,
    crimeZones: false,
  });
  const [pois, setPois] = useState<{
    police: POI[];
    hospitals: POI[];
    liquorShops: POI[];
  }>({
    police: [],
    hospitals: [],
    liquorShops: [],
  });

  const { showToast } = useToast();

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter([latitude, longitude]);
          setZoom(15);
        },
        (error) => {
          console.error("Error getting location:", error);
          showToast({
            title: 'Location Error',
            message: 'Could not get your location. Using default city center.',
            type: 'warning',
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  }, []);

  // Fetch POIs when toggled
  useEffect(() => {
    const fetchActivePOIs = async () => {
      if (!source) return;
      
      try {
        const bbox = route 
          ? getBoundingBox(route.geometry.coordinates) 
          : getBoundingBoxFromPoint(source.coordinates, 2);
        
        if (activePOIs.police && pois.police.length === 0) {
          const policeStations = await fetchPOIs('police', bbox);
          setPois(prev => ({ ...prev, police: policeStations }));
        }
        
        if (activePOIs.hospitals && pois.hospitals.length === 0) {
          const hospitals = await fetchPOIs('hospitals', bbox);
          setPois(prev => ({ ...prev, hospitals: hospitals }));
        }
        
        if (activePOIs.liquorShops && pois.liquorShops.length === 0) {
          const liquorShops = await fetchPOIs('liquor_shops', bbox);
          setPois(prev => ({ ...prev, liquorShops: liquorShops }));
        }
      } catch (error) {
        console.error("Error fetching POIs:", error);
        showToast({
          title: 'Error',
          message: 'Could not fetch points of interest',
          type: 'error',
        });
      }
    };
    
    fetchActivePOIs();
  }, [activePOIs, source, route]);

  const handleFindRoute = async () => {
    if (!source || !destination) {
      showToast({
        title: 'Missing Information',
        message: 'Please select both source and destination',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const safeRoute = await fetchSafeRoute(
        source.coordinates,
        destination.coordinates,
        selectedTime
      );
      
      setRoute(safeRoute);
      
      if (safeRoute && safeRoute.geometry.coordinates.length > 0) {
        const bbox = getBoundingBox(safeRoute.geometry.coordinates);
      }
      
    } catch (error) {
      console.error("Error fetching route:", error);
      showToast({
        title: 'Error',
        message: 'Could not calculate route. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePOIToggle = (category: POICategory) => {
    setActivePOIs(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getBoundingBox = (coordinates: [number, number][]): [[number, number], [number, number]] => {
    if (!coordinates.length) return [[0, 0], [0, 0]];
    
    let minLat = coordinates[0][0];
    let maxLat = coordinates[0][0];
    let minLng = coordinates[0][1];
    let maxLng = coordinates[0][1];
    
    coordinates.forEach(([lat, lng]) => {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });
    
    const latBuffer = (maxLat - minLat) * 0.1;
    const lngBuffer = (maxLng - minLng) * 0.1;
    
    return [
      [minLat - latBuffer, minLng - lngBuffer],
      [maxLat + latBuffer, maxLng + lngBuffer]
    ];
  };
  
  const getBoundingBoxFromPoint = (
    [lat, lng]: [number, number], 
    radiusKm: number
  ): [[number, number], [number, number]] => {
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
    
    return [
      [lat - latDelta, lng - lngDelta],
      [lat + latDelta, lng + lngDelta]
    ];
  };

  const MapBoundsUpdater = ({ route }: { route: Route | null }) => {
    const map = useMap();
    
    useEffect(() => {
      if (route && route.geometry.coordinates.length > 0) {
        const bbox = getBoundingBox(route.geometry.coordinates);
        map.fitBounds([
          [bbox[0][0], bbox[0][1]],
          [bbox[1][0], bbox[1][1]]
        ]);
      }
    }, [route, map]);
    
    return null;
  };

  const renderMarkers = () => {
    const markers = [];
    
    if (source) {
      markers.push(
        <Marker 
          key="source" 
          position={[source.coordinates[0], source.coordinates[1]]}
          icon={defaultIcon}
        >
          <Popup>
            <div>
              <strong>Start:</strong> {source.name}
            </div>
          </Popup>
        </Marker>
      );
    }
    
    if (destination) {
      markers.push(
        <Marker 
          key="destination" 
          position={[destination.coordinates[0], destination.coordinates[1]]}
          icon={defaultIcon}
        >
          <Popup>
            <div>
              <strong>Destination:</strong> {destination.name}
            </div>
          </Popup>
        </Marker>
      );
    }
    
    if (activePOIs.police) {
      pois.police.forEach((poi, index) => {
        markers.push(
          <Marker 
            key={`police-${index}`} 
            position={[poi.coordinates[0], poi.coordinates[1]]}
            icon={defaultIcon}
          >
            <Popup>
              <div>
                <strong>Police Station:</strong> {poi.name}
              </div>
            </Popup>
          </Marker>
        );
      });
    }
    
    if (activePOIs.hospitals) {
      pois.hospitals.forEach((poi, index) => {
        markers.push(
          <Marker 
            key={`hospital-${index}`} 
            position={[poi.coordinates[0], poi.coordinates[1]]}
            icon={defaultIcon}
          >
            <Popup>
              <div>
                <strong>Hospital:</strong> {poi.name}
              </div>
            </Popup>
          </Marker>
        );
      });
    }
    
    if (activePOIs.liquorShops) {
      pois.liquorShops.forEach((poi, index) => {
        markers.push(
          <Marker 
            key={`liquor-${index}`} 
            position={[poi.coordinates[0], poi.coordinates[1]]}
            icon={defaultIcon}
          >
            <Popup>
              <div>
                <strong>Liquor Shop:</strong> {poi.name}
              </div>
            </Popup>
          </Marker>
        );
      });
    }
    
    return markers;
  };

  return (
    <div className="h-[calc(100vh-64px)] pt-16 relative">
      {/* Search Panel */}
      <div className="absolute top-20 left-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Source</label>
            <LocationSearch 
              placeholder="Enter starting point"
              icon={<MapPin size={18} className="text-gray-400" />}
              onSelect={(location) => setSource(location)}
              value={source?.name || ''}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Destination</label>
            <LocationSearch 
              placeholder="Enter destination"
              icon={<Navigation size={18} className="text-gray-400" />}
              onSelect={(location) => setDestination(location)}
              value={destination?.name || ''}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <div className="flex space-x-2">
              <TimePicker 
                value={selectedTime}
                onChange={(date) => setSelectedTime(date)}
              />
              <button
                onClick={handleFindRoute}
                disabled={isLoading || !source || !destination}
                className="whitespace-nowrap flex-shrink-0 bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:bg-blue-300"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Search size={18} className="mr-2" />
                    Find Safe Route
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => handlePOIToggle('police')}
            className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
              activePOIs.police 
                ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            <Shield size={16} className="mr-1" />
            Police Stations
          </button>
          
          <button
            onClick={() => handlePOIToggle('hospitals')}
            className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
              activePOIs.hospitals 
                ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            <Building size={16} className="mr-1" />
            Hospitals
          </button>
          
          <button
            onClick={() => handlePOIToggle('liquorShops')}
            className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
              activePOIs.liquorShops 
                ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            <Wine size={16} className="mr-1" />
            Liquor Shops
          </button>
          
          <button
            onClick={() => handlePOIToggle('crimeZones')}
            className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
              activePOIs.crimeZones 
                ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            <AlertTriangle size={16} className="mr-1" />
            Crime Zones
          </button>
        </div>
      </div>
      
      {/* Map Container */}
      <div className="h-full">
        <MapContainer 
          center={center} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {renderMarkers()}
          
          {route && <RouteLayer route={route} />}
          
          <MapBoundsUpdater route={route} />
          
          <MapControls />
        </MapContainer>
        
        {route && <SafetyLegend />}
      </div>
    </div>
  );
};

export default MapPage;