import { LOCATIONIQ_API_KEY, LOCATIONIQ_API, BANGALORE_BOUNDS } from '../config';
import type { Location } from '../types';

export const searchLocation = async (query: string): Promise<Location[]> => {
  if (!LOCATIONIQ_API_KEY) {
    throw new Error('LocationIQ API key is not configured');
  }

  const { minLat, maxLat, minLng, maxLng } = BANGALORE_BOUNDS;
  const viewbox = `${minLng},${maxLat},${maxLng},${minLat}`;
  
  const url = new URL(`${LOCATIONIQ_API}/search.php`);
  url.searchParams.append('key', LOCATIONIQ_API_KEY);
  url.searchParams.append('q', query);
  url.searchParams.append('format', 'json');
  url.searchParams.append('limit', '10');
  url.searchParams.append('countrycodes', 'in');
  url.searchParams.append('bounded', '1');
  url.searchParams.append('viewbox', viewbox);
  url.searchParams.append('dedupe', '1');

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to search location');
  }

  const data = await response.json();

  return data.map((item: any) => ({
    name: item.display_name.split(',')[0],
    description: item.display_name,
    coordinates: [parseFloat(item.lat), parseFloat(item.lon)]
  }));
};