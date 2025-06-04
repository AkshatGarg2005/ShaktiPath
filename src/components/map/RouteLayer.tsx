import React, { useEffect, useState } from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import type { Route, RouteSegment } from '../../types';

interface RouteLayerProps {
  route: Route;
}

const RouteLayer: React.FC<RouteLayerProps> = ({ route }) => {
  const [segments, setSegments] = useState<RouteSegment[]>([]);
  
  useEffect(() => {
    // Convert route into segments with color information
    if (route && route.segments) {
      setSegments(route.segments);
    }
  }, [route]);
  
  // Map safety color to actual color values
  const getColorForSafety = (safetyColor: string): string => {
    switch (safetyColor) {
      case 'red':
        return '#ef4444';
      case 'yellow':
        return '#f59e0b';
      case 'green':
        return '#10b981';
      default:
        return '#3b82f6'; // Blue default
    }
  };
  
  // Get human-readable safety level
  const getSafetyDescription = (safetyColor: string): string => {
    switch (safetyColor) {
      case 'red':
        return 'High Risk Area';
      case 'yellow':
        return 'Moderate Risk Area';
      case 'green':
        return 'Low Risk Area';
      default:
        return 'Unknown Safety Level';
    }
  };
  
  if (!segments.length) {
    // If no segments are available but we have route coordinates, display a simple blue route
    return (
      <Polyline
        positions={route.geometry.coordinates.map(coord => [coord[0], coord[1]])}
        pathOptions={{ color: '#3b82f6', weight: 5 }}
      />
    );
  }
  
  return (
    <>
      {segments.map((segment, index) => (
        <Polyline
          key={index}
          positions={segment.coordinates.map(coord => [coord[0], coord[1]])}
          pathOptions={{ 
            color: getColorForSafety(segment.safetyColor), 
            weight: 5,
            opacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round'
          }}
        >
          <Tooltip sticky>
            <div className="text-sm font-medium">
              {getSafetyDescription(segment.safetyColor)}
            </div>
            {segment.incidents > 0 && (
              <div className="text-xs">
                {segment.incidents} incident{segment.incidents !== 1 ? 's' : ''} in the last 30 days
              </div>
            )}
          </Tooltip>
        </Polyline>
      ))}
    </>
  );
};

export default RouteLayer;