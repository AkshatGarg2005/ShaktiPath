import { API_URL } from '../config';
import type { CrimeIncident, TimeFilter } from '../types';

export const fetchCrimeData = async (timeFilter: TimeFilter): Promise<CrimeIncident[]> => {
  // For demo purposes, mock the API call
  console.log('Fetching crime data with filter:', timeFilter);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Generate mock crime data
  const mockCrimes: CrimeIncident[] = [];
  
  // Number of incidents based on time filter
  let numIncidents = 0;
  if (timeFilter === '24h') {
    numIncidents = 20;
  } else if (timeFilter === '48h') {
    numIncidents = 40;
  } else if (timeFilter === '72h') {
    numIncidents = 60;
  } else {
    numIncidents = 100;
  }
  
  const crimeCategories = [
    'Theft',
    'Assault',
    'Harassment',
    'Robbery',
    'Purse Snatching',
    'Eve Teasing',
    'Public Indecency',
    'Stalking'
  ];
  
  const locations = [
    'Main Street',
    'Railway Station',
    'Market Area',
    'City Park',
    'College Road',
    'Bus Terminal',
    'Shopping Mall',
    'Residential Area',
    'Tech Park',
    'Metro Station'
  ];
  
  const now = new Date();
  
  for (let i = 0; i < numIncidents; i++) {
    // Generate a random date within the time filter
    let maxHoursAgo = 0;
    if (timeFilter === '24h') {
      maxHoursAgo = 24;
    } else if (timeFilter === '48h') {
      maxHoursAgo = 48;
    } else if (timeFilter === '72h') {
      maxHoursAgo = 72;
    } else {
      maxHoursAgo = 168; // 7 days
    }
    
    const hoursAgo = Math.random() * maxHoursAgo;
    const date = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    
    const category = crimeCategories[Math.floor(Math.random() * crimeCategories.length)];
    const locationIndex = Math.floor(Math.random() * locations.length);
    const location = locations[locationIndex];
    
    // Generate random coordinates for India (rough bounding box)
    const lat = 8.0 + Math.random() * 28.0; // India latitude range approx
    const lng = 68.0 + Math.random() * 29.0; // India longitude range approx
    
    mockCrimes.push({
      id: `crime-${i}`,
      category,
      description: `Reported ${category.toLowerCase()} incident`,
      dateTime: date.toISOString(),
      address: `Near ${location}, ${['New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'][Math.floor(Math.random() * 5)]}`,
      coordinates: [lat, lng]
    });
  }
  
  // Sort by date (newest first)
  mockCrimes.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  
  return mockCrimes;
  
  /* In a real implementation:
  const response = await fetch(`${API_URL}/crimes?timeFilter=${timeFilter}`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch crime data');
  }
  
  return await response.json();
  */
};