# ShaktiPath - Women Safety Navigation App

ShaktiPath is a comprehensive women safety application that provides intelligent route planning based on multiple safety factors including street lighting, CCTV coverage, police presence, crowd density, and avoidance of potentially unsafe areas.

## Features

- **AI-Powered Route Planning**: Intelligent routing that prioritizes safety over speed
- **5-Point Safety Analysis**: 
  - Street lighting density
  - CCTV coverage
  - Police station proximity
  - Real-time crowd levels
  - Alcohol shop avoidance
- **Real-time Location Services**: GPS-based current location detection
- **Emergency SOS System**: One-tap emergency alerts to trusted contacts
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## API Integration

The application integrates with multiple APIs to provide real-time data:

### Required API Keys

Add these API keys to your `.env` file:

```env
# Google Maps API (Primary)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# OpenCage Geocoding API (For reverse geocoding)
VITE_OPENCAGE_API_KEY=your_opencage_api_key_here

# MapBox API (Fallback routing)
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here

# Supabase (Database & Auth)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### API Services Used

1. **Google Maps API**:
   - Places API for location search
   - Directions API for route calculation
   - Nearby Search for safety facilities

2. **OpenCage Geocoding API**:
   - Reverse geocoding for address lookup
   - Location coordinate conversion

3. **MapBox API**:
   - Fallback routing service
   - Alternative map tiles

4. **Supabase**:
   - User authentication
   - Database for user data and route history

### Getting API Keys

#### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

#### OpenCage Geocoding API
1. Visit [OpenCage Data](https://opencagedata.com/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier includes 2,500 requests/day

#### MapBox API
1. Go to [MapBox](https://www.mapbox.com/)
2. Create an account
3. Get your access token from the account page
4. Free tier includes 50,000 requests/month

#### Supabase
1. Visit [Supabase](https://supabase.com/)
2. Create a new project
3. Get your project URL and anon key from project settings
4. Or click "Connect to Supabase" in the Bolt interface

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file with the required API keys
4. Start the development server:
   ```bash
   npm run dev
   ```

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Maps**: Leaflet, React-Leaflet
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Authentication**: Supabase Auth (when connected)

## Safety Features

### Route Analysis
The application analyzes multiple safety factors:

- **Street Lighting**: Evaluates lighting conditions along the route
- **CCTV Density**: Checks surveillance coverage
- **Police Stations**: Proximity to law enforcement
- **Crowd Levels**: Real-time foot traffic data
- **Risk Avoidance**: Automatically avoids liquor shops and high-risk areas

### Emergency Features
- **SOS Button**: Instant emergency alert system
- **Emergency Contacts**: Pre-configured trusted contacts
- **Location Sharing**: Real-time location sharing during emergencies
- **Safety Alerts**: Route-specific warnings and recommendations

## Development

### Project Structure
```
src/
├── components/          # React components
├── contexts/           # React contexts (Auth, etc.)
├── services/           # API services and utilities
├── types/             # TypeScript type definitions
└── styles/            # CSS and styling files
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Security & Privacy

- All API keys are stored securely in environment variables
- User location data is processed locally when possible
- Emergency contacts are encrypted in the database
- No tracking of user movements without consent

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@shaktipath.com or create an issue in the repository.