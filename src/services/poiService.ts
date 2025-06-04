import { API_URL } from '../config';
import type { POI } from '../types';

export const fetchPOIs = async (
  category: string,
  bbox: [[number, number], [number, number]]
): Promise<POI[]> => {
  // For demo purposes, mock the API call
  console.log('Fetching POIs for category:', category, 'within bbox:', bbox);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate mock POIs based on category
  const mockPOIs: POI[] = [];
  const numPOIs = Math.floor(Math.random() * 10) + 5; // 5-14 POIs
  
  for (let i = 0; i < numPOIs; i++) {
    // Generate random coordinates within the bounding box
    const lat = bbox[0][0] + Math.random() * (bbox[1][0] - bbox[0][0]);
    const lng = bbox[0][1] + Math.random() * (bbox[1][1] - bbox[0][1]);
    
    let name = '';
    let description = '';
    
    if (category === 'police') {
      name = `Police Station ${i + 1}`;
      description = 'Law enforcement facility';
    } else if (category === 'hospitals') {
      name = `${['City', 'Community', 'General', 'Memorial'][Math.floor(Math.random() * 4)]} Hospital`;
      description = '24/7 emergency services';
    } else if (category === 'liquor_shops') {
      name = `${['Royal', 'Star', 'City', 'Premium'][Math.floor(Math.random() * 4)]} Wine & Spirits`;
      description = 'Alcohol retailer';
    }
    
    mockPOIs.push({
      id: `poi-${category}-${i}`,
      name,
      description,
      category,
      coordinates: [lat, lng]
    });
  }
  
  return mockPOIs;
  
  /* In a real implementation:
  // Use the Overpass API to fetch POIs
  const overpassQuery = buildOverpassQuery(category, bbox);
  
  // Or use our backend which might cache these results
  const response = await fetch(`${API_URL}/pois`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      category,
      bbox
    }),
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch POIs');
  }
  
  return await response.json();
  */
};

// Helper function to build an Overpass API query
function buildOverpassQuery(category: string, bbox: [[number, number], [number, number]]) {
  const [minLat, minLng] = bbox[0];
  const [maxLat, maxLng] = bbox[1];
  
  let amenity = '';
  
  if (category === 'police') {
    amenity = 'police';
  } else if (category === 'hospitals') {
    amenity = 'hospital';
  } else if (category === 'liquor_shops') {
    amenity = 'bar|pub|nightclub';
  }
  
  return `
    [out:json];
    (
      node["amenity"=${amenity}](${minLat},${minLng},${maxLat},${maxLng});
      way["amenity"=${amenity}](${minLat},${minLng},${maxLat},${maxLng});
      relation["amenity"=${amenity}](${minLat},${minLng},${maxLat},${maxLng});
    );
    out center;
  `;
}