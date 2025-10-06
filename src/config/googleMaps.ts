/**
 * Google Maps Configuration
 * 
 * The Google Maps JavaScript API key is a PUBLISHABLE key that's safe to include
 * in client-side code. It should be protected by:
 * 1. HTTP referrer restrictions (set in Google Cloud Console)
 * 2. API restrictions (limit to Maps JavaScript API, Places API, Geocoding API)
 * 
 * To set up restrictions:
 * 1. Go to https://console.cloud.google.com/apis/credentials
 * 2. Click on your API key
 * 3. Under "Application restrictions", select "HTTP referrers"
 * 4. Add your domains (e.g., *.lovableproject.com, yourdomain.com)
 * 5. Under "API restrictions", select "Restrict key" and choose:
 *    - Maps JavaScript API
 *    - Places API
 *    - Geocoding API
 *    - Directions API
 */

// Google Maps JavaScript API key (publishable/public key)
// This key is meant to be visible in the browser and should be protected
// via HTTP referrer restrictions in Google Cloud Console
export const GOOGLE_MAPS_API_KEY = 'AIzaSyBbJbSHj4dI5igT0K5WPFISHYNJuVy48oE';

// Default map center (India)
export const DEFAULT_MAP_CENTER = { lat: 20.5937, lng: 78.9629 };

// Default zoom level
export const DEFAULT_MAP_ZOOM = 5;

// Map libraries to load
export const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry', 'drawing'] as const;

// Map styling options
export const MAP_STYLES = {
  default: [],
  dark: [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] }
  ]
};
