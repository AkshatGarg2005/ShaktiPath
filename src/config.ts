// API configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// External API keys
export const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
export const OPENROUTE_API_KEY = import.meta.env.VITE_OPENROUTE_API_KEY;

// API endpoints
export const LOCATIONIQ_API = 'https://us1.locationiq.com/v1';
export const OPENROUTE_API = 'https://api.openrouteservice.org/v2';

// Bangalore bounds for location search
export const BANGALORE_BOUNDS = {
  minLat: 12.8340,
  maxLat: 13.1393,
  minLng: 77.4601,
  maxLng: 77.7800
};