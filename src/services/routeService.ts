import { OPENROUTE_API_KEY, API_URL } from '../config';
import type { Route } from '../types';

export const fetchSafeRoute = async (
  start: [number, number],
  end: [number, number],
  time: Date
): Promise<Route> => {
  // For demo purposes, mock the API call with more realistic road routes
  console.log('Fetching route from', start, 'to', end, 'at', time);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate waypoints to simulate road routes
  const waypoints = generateRoadWaypoints(start, end);
  
  // Generate a mock route with safety segments using the waypoints
  const mockRoute: Route = {
    geometry: {
      type: 'LineString',
      coordinates: waypoints
    },
    distance: calculateRouteDistance(waypoints), // Distance in meters
    duration: Math.floor(calculateRouteDistance(waypoints) / 1.4), // Duration in seconds (assuming 1.4 m/s walking speed)
    segments: generateSafetySegments(waypoints)
  };
  
  return mockRoute;
};

// Helper function to generate waypoints that follow a road-like pattern
function generateRoadWaypoints(
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const waypoints: [number, number][] = [start];
  
  // Calculate the main direction
  const deltaLat = end[0] - start[0];
  const deltaLng = end[1] - start[1];
  
  // Generate intermediate points with slight variations to simulate roads
  const numPoints = Math.floor(Math.random() * 5) + 8; // 8-12 points
  
  let currentLat = start[0];
  let currentLng = start[1];
  
  for (let i = 1; i < numPoints - 1; i++) {
    const ratio = i / (numPoints - 1);
    
    // Add some randomness to make it look like roads
    // Smaller jitter values for more realistic road-like paths
    const jitterLat = (Math.random() - 0.5) * 0.001;
    const jitterLng = (Math.random() - 0.5) * 0.001;
    
    // Sometimes make 90-degree turns to simulate block navigation
    if (Math.random() < 0.3) {
      if (Math.random() < 0.5) {
        currentLat = start[0] + ratio * deltaLat + jitterLat;
        currentLng = currentLng + jitterLng;
      } else {
        currentLat = currentLat + jitterLat;
        currentLng = start[1] + ratio * deltaLng + jitterLng;
      }
    } else {
      currentLat = start[0] + ratio * deltaLat + jitterLat;
      currentLng = start[1] + ratio * deltaLng + jitterLng;
    }
    
    waypoints.push([currentLat, currentLng]);
  }
  
  waypoints.push(end);
  return waypoints;
}

// Helper function to calculate route distance in meters
function calculateRouteDistance(waypoints: [number, number][]): number {
  let distance = 0;
  for (let i = 1; i < waypoints.length; i++) {
    distance += getDistanceFromLatLonInMeters(
      waypoints[i-1][0],
      waypoints[i-1][1],
      waypoints[i][0],
      waypoints[i][1]
    );
  }
  return distance;
}

// Helper function to calculate distance between two points in meters
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// Helper function to generate safety segments using waypoints
function generateSafetySegments(waypoints: [number, number][]) {
  const segments = [];
  const numSegments = Math.min(waypoints.length - 1, Math.floor(Math.random() * 3) + 3);
  const pointsPerSegment = Math.floor(waypoints.length / numSegments);
  
  for (let i = 0; i < numSegments; i++) {
    const start = i * pointsPerSegment;
    const end = i === numSegments - 1 ? waypoints.length : (i + 1) * pointsPerSegment;
    
    const segmentPoints = waypoints.slice(start, end);
    
    // Determine safety color based on various factors
    let safetyColor;
    const timeOfDay = new Date().getHours();
    const isNightTime = timeOfDay < 6 || timeOfDay > 18;
    
    if (isNightTime) {
      safetyColor = Math.random() < 0.6 ? 'red' : 'yellow';
    } else {
      safetyColor = Math.random() < 0.7 ? 'green' : 'yellow';
    }
    
    // Generate incidents based on safety color
    let incidents = 0;
    if (safetyColor === 'red') {
      incidents = Math.floor(Math.random() * 5) + 3; // 3-7 incidents
    } else if (safetyColor === 'yellow') {
      incidents = Math.floor(Math.random() * 2) + 1; // 1-2 incidents
    }
    
    segments.push({
      coordinates: segmentPoints,
      safetyColor,
      incidents
    });
  }
  
  return segments;
}