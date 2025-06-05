import { OPENROUTE_API_KEY, OPENROUTE_API } from '../config';
import type { Route } from '../types';

export const fetchSafeRoute = async (
  start: [number, number],
  end: [number, number],
  time: Date
): Promise<Route> => {
  if (!OPENROUTE_API_KEY) {
    throw new Error('OpenRoute API key is not configured');
  }

  // OpenRouteService expects coordinates in [longitude, latitude] format
  const coordinates = [
    [start[1], start[0]],
    [end[1], end[0]]
  ];

  const response = await fetch(`${OPENROUTE_API}/directions/foot-walking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': OPENROUTE_API_KEY
    },
    body: JSON.stringify({
      coordinates,
      instructions: true,
      format: 'geojson',
      preference: 'recommended',
      units: 'meters'
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch route');
  }

  const data = await response.json();
  const route = data.features[0];

  // Convert coordinates from [longitude, latitude] to [latitude, longitude]
  const convertedCoordinates = route.geometry.coordinates.map(
    ([lng, lat]: number[]) => [lat, lng] as [number, number]
  );

  // Generate safety segments based on time of day and route sections
  const segments = generateSafetySegments(convertedCoordinates, time);

  return {
    geometry: {
      type: 'LineString',
      coordinates: convertedCoordinates
    },
    distance: route.properties.segments[0].distance,
    duration: route.properties.segments[0].duration,
    segments
  };
};

function generateSafetySegments(
  coordinates: [number, number][],
  time: Date
): Route['segments'] {
  const hour = time.getHours();
  const isNightTime = hour < 6 || hour > 18;
  const segments = [];
  
  // Split route into 3-5 segments
  const numSegments = Math.min(coordinates.length - 1, Math.floor(Math.random() * 3) + 3);
  const pointsPerSegment = Math.floor(coordinates.length / numSegments);

  for (let i = 0; i < numSegments; i++) {
    const start = i * pointsPerSegment;
    const end = i === numSegments - 1 ? coordinates.length : (i + 1) * pointsPerSegment;
    const segmentPoints = coordinates.slice(start, end);

    // Determine safety color based on time and random factors
    let safetyColor;
    if (isNightTime) {
      safetyColor = Math.random() < 0.6 ? 'red' : 'yellow';
    } else {
      safetyColor = Math.random() < 0.7 ? 'green' : 'yellow';
    }

    // Generate incidents based on safety color
    let incidents = 0;
    if (safetyColor === 'red') {
      incidents = Math.floor(Math.random() * 5) + 3;
    } else if (safetyColor === 'yellow') {
      incidents = Math.floor(Math.random() * 2) + 1;
    }

    segments.push({
      coordinates: segmentPoints,
      safetyColor,
      incidents
    });
  }

  return segments;
}