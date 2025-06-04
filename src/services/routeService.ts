import { OPENROUTE_API_KEY, API_URL } from '../config';
import type { Route } from '../types';

export const fetchSafeRoute = async (
  start: [number, number],
  end: [number, number],
  time: Date
): Promise<Route> => {
  // For demo purposes, mock the API call
  console.log('Fetching route from', start, 'to', end, 'at', time);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate a mock route with safety segments
  const mockRoute: Route = {
    geometry: {
      type: 'LineString',
      coordinates: generateRouteCoordinates(start, end, 20)
    },
    distance: Math.random() * 5000, // Random distance in meters
    duration: Math.random() * 3600, // Random duration in seconds
    segments: generateSafetySegments(start, end)
  };
  
  return mockRoute;
  
  /* In a real implementation:
  // First, get the route from OpenRouteService
  const openRouteUrl = `https://api.openrouteservice.org/v2/directions/foot-walking`;
  
  const response = await fetch(openRouteUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': OPENROUTE_API_KEY
    },
    body: JSON.stringify({
      coordinates: [
        [start[1], start[0]], // Note: OpenRouteService uses [lon, lat] format
        [end[1], end[0]]
      ],
      format: 'geojson'
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch route from OpenRouteService');
  }
  
  const routeData = await response.json();
  
  // Now, send the route to our backend to get safety scores
  const safetyResponse = await fetch(`${API_URL}/routes/safety`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      route: routeData.features[0].geometry,
      time: time.toISOString()
    }),
    credentials: 'include'
  });
  
  if (!safetyResponse.ok) {
    throw new Error('Failed to get safety information');
  }
  
  return await safetyResponse.json();
  */
};

// Helper function to generate coordinates between two points
function generateRouteCoordinates(
  start: [number, number],
  end: [number, number],
  numPoints: number
): [number, number][] {
  const coordinates: [number, number][] = [start];
  
  for (let i = 1; i < numPoints - 1; i++) {
    const ratio = i / (numPoints - 1);
    
    // Add some randomness to make the route look natural
    const jitterLat = (Math.random() - 0.5) * 0.005;
    const jitterLng = (Math.random() - 0.5) * 0.005;
    
    const lat = start[0] + ratio * (end[0] - start[0]) + jitterLat;
    const lng = start[1] + ratio * (end[1] - start[1]) + jitterLng;
    
    coordinates.push([lat, lng]);
  }
  
  coordinates.push(end);
  return coordinates;
}

// Helper function to generate safety segments
function generateSafetySegments(
  start: [number, number],
  end: [number, number]
) {
  // Create 3-5 segments with different safety levels
  const numSegments = Math.floor(Math.random() * 3) + 3;
  const safetyColors = ['green', 'yellow', 'red'];
  const segments = [];
  
  for (let i = 0; i < numSegments; i++) {
    const startRatio = i / numSegments;
    const endRatio = (i + 1) / numSegments;
    
    const segmentStart: [number, number] = [
      start[0] + startRatio * (end[0] - start[0]),
      start[1] + startRatio * (end[1] - start[1])
    ];
    
    const segmentEnd: [number, number] = [
      start[0] + endRatio * (end[0] - start[0]),
      start[1] + endRatio * (end[1] - start[1])
    ];
    
    // Generate some points between segment start and end
    const numPoints = Math.floor(Math.random() * 5) + 3;
    const coordinates = generateRouteCoordinates(segmentStart, segmentEnd, numPoints);
    
    // Randomly select a safety color, but make sure we have some variety
    let safetyColor;
    if (i === 0) {
      // First segment is random
      safetyColor = safetyColors[Math.floor(Math.random() * safetyColors.length)];
    } else {
      // Subsequent segments should try to be different from previous
      const prevColor = segments[i - 1].safetyColor;
      const availableColors = safetyColors.filter(color => color !== prevColor);
      safetyColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    }
    
    // Generate random incident count based on safety color
    let incidents = 0;
    if (safetyColor === 'red') {
      incidents = Math.floor(Math.random() * 10) + 8; // 8-17
    } else if (safetyColor === 'yellow') {
      incidents = Math.floor(Math.random() * 7) + 1; // 1-7
    } else {
      incidents = Math.floor(Math.random() * 1); // 0-1
    }
    
    segments.push({
      coordinates,
      safetyColor,
      incidents
    });
  }
  
  return segments;
}