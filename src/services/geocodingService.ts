import { LOCATIONIQ_API_KEY } from '../config';
import type { Location } from '../types';

export const searchLocation = async (query: string): Promise<Location[]> => {
  // For demo purposes, mock the API call with more detailed locations
  console.log('Searching for location:', query);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Generate mock results based on query
  const mockResults: Location[] = [];
  
  // Detailed locations in Bangalore as an example
  const bangaloreLocations = [
    { name: 'Indiranagar', description: 'Indiranagar, Bangalore', lat: 12.9719, lng: 77.6412 },
    { name: 'Koramangala', description: 'Koramangala, Bangalore', lat: 12.9279, lng: 77.6271 },
    { name: 'MG Road', description: 'MG Road, Bangalore', lat: 12.9756, lng: 77.6097 },
    { name: 'Whitefield', description: 'Whitefield, Bangalore', lat: 12.9698, lng: 77.7499 },
    { name: 'Electronic City', description: 'Electronic City, Bangalore', lat: 12.8399, lng: 77.6770 },
    { name: 'HSR Layout', description: 'HSR Layout, Bangalore', lat: 12.9116, lng: 77.6474 },
    { name: 'Jayanagar', description: 'Jayanagar, Bangalore', lat: 12.9250, lng: 77.5938 },
    { name: 'BTM Layout', description: 'BTM Layout, Bangalore', lat: 12.9166, lng: 77.6101 },
    // Add landmarks
    { name: 'Bangalore Palace', description: 'Palace Road, Bangalore', lat: 12.9988, lng: 77.5921 },
    { name: 'Cubbon Park', description: 'Kasturba Road, Bangalore', lat: 12.9763, lng: 77.5929 },
    { name: 'Lalbagh Botanical Garden', description: 'Lalbagh Road, Bangalore', lat: 12.9507, lng: 77.5848 },
    // Add metro stations
    { name: 'Majestic Metro Station', description: 'Metro Station, Bangalore', lat: 12.9766, lng: 77.5713 },
    { name: 'Trinity Metro Station', description: 'Metro Station, Bangalore', lat: 12.9783, lng: 77.6179 },
    // Add shopping malls
    { name: 'Phoenix Marketcity', description: 'Whitefield Road, Bangalore', lat: 12.9959, lng: 77.6963 },
    { name: 'UB City Mall', description: 'Vittal Mallya Road, Bangalore', lat: 12.9715, lng: 77.5959 }
  ];
  
  // Filter locations based on query
  const lowerQuery = query.toLowerCase();
  const filteredLocations = bangaloreLocations.filter(
    location => location.name.toLowerCase().includes(lowerQuery) || 
                location.description.toLowerCase().includes(lowerQuery)
  );
  
  // Convert to Location type
  filteredLocations.forEach(location => {
    mockResults.push({
      name: location.name,
      description: location.description,
      coordinates: [location.lat, location.lng]
    });
  });
  
  return mockResults;
  
  /* In a real implementation:
  const url = `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query)}&format=json&limit=10&countrycodes=in&bounded=1&viewbox=77.4,13.1,77.8,12.8`; // Bangalore bounding box
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to search location');
  }
  
  const data = await response.json();
  
  return data.map((item: any) => ({
    name: item.display_name.split(',')[0],
    description: item.display_name,
    coordinates: [parseFloat(item.lat), parseFloat(item.lon)]
  }));
  */
};