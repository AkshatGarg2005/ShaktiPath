import { LOCATIONIQ_API_KEY } from '../config';
import type { Location } from '../types';

export const searchLocation = async (query: string): Promise<Location[]> => {
  // For demo purposes, mock the API call
  console.log('Searching for location:', query);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Generate mock results based on query
  const mockResults: Location[] = [];
  
  // Indian cities as mock data
  const indianCities = [
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    { name: 'Lucknow', lat: 26.8467, lng: 80.9462 }
  ];
  
  // Filter cities based on query
  const lowerQuery = query.toLowerCase();
  const filteredCities = indianCities.filter(
    city => city.name.toLowerCase().includes(lowerQuery)
  );
  
  // Generate results
  filteredCities.forEach(city => {
    mockResults.push({
      name: city.name,
      description: `${city.name}, India`,
      coordinates: [city.lat, city.lng]
    });
    
    // Add some landmarks for variety
    if (mockResults.length < 5) {
      mockResults.push({
        name: `${city.name} Railway Station`,
        description: `Railway Station, ${city.name}, India`,
        coordinates: [city.lat + 0.01, city.lng + 0.01]
      });
      
      mockResults.push({
        name: `${city.name} Airport`,
        description: `Airport, ${city.name}, India`,
        coordinates: [city.lat - 0.02, city.lng - 0.02]
      });
    }
  });
  
  // If no results matched, provide some default suggestions
  if (mockResults.length === 0) {
    mockResults.push({
      name: 'India Gate',
      description: 'Monument, New Delhi, India',
      coordinates: [28.6129, 77.2295]
    });
    
    mockResults.push({
      name: 'Gateway of India',
      description: 'Monument, Mumbai, India',
      coordinates: [18.9217, 72.8347]
    });
    
    mockResults.push({
      name: 'Taj Mahal',
      description: 'Monument, Agra, India',
      coordinates: [27.1751, 78.0421]
    });
  }
  
  return mockResults;
  
  /* In a real implementation:
  const url = `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query)}&format=json&limit=5`;
  
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