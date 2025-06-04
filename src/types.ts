// User types
export interface User {
  id: string;
  name: string;
  email: string;
}

// Location types
export interface Location {
  name: string;
  description?: string;
  coordinates: [number, number]; // [latitude, longitude]
}

// Route types
export interface Route {
  geometry: {
    type: string;
    coordinates: [number, number][]; // Array of [latitude, longitude]
  };
  distance: number; // in meters
  duration: number; // in seconds
  segments: RouteSegment[];
}

export interface RouteSegment {
  coordinates: [number, number][];
  safetyColor: string; // 'red', 'yellow', 'green'
  incidents: number;
}

// POI types
export interface POI {
  id: string;
  name: string;
  description?: string;
  category: string;
  coordinates: [number, number]; // [latitude, longitude]
}

export type POICategory = 'police' | 'hospitals' | 'liquorShops' | 'crimeZones';

// Crime types
export interface CrimeIncident {
  id: string;
  category: string;
  description: string;
  dateTime: string; // ISO string
  address: string;
  coordinates: [number, number]; // [latitude, longitude]
}

export type TimeFilter = '24h' | '48h' | '72h' | 'week';

// Toast types
export interface ToastProps {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}