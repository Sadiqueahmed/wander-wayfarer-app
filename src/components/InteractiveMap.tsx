import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Navigation, Layers, Settings } from 'lucide-react';

// Google Maps token input component
const GoogleMapsTokenInput = ({ onTokenSet }: { onTokenSet: (token: string) => void }) => {
  const [token, setToken] = useState('');
  
  const handleSetToken = () => {
    if (token.trim()) {
      onTokenSet(token.trim());
    }
  };
  
  return (
    <Card className="absolute top-4 left-4 right-4 z-10 p-4 bg-background/95 backdrop-blur">
      <div className="space-y-3">
        <h3 className="font-semibold">Google Maps Integration</h3>
        <p className="text-sm text-muted-foreground">
          Enter your Google Maps API key to initialize the map
        </p>
        <Input
          type="text"
          placeholder="Enter Google Maps API key..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full"
        />
        <Button onClick={handleSetToken} className="w-full gradient-hero text-white" disabled={!token.trim()}>
          Initialize Map
        </Button>
        <p className="text-xs text-muted-foreground">
          Get your API key from the Google Cloud Console
        </p>
      </div>
    </Card>
  );
};

interface InteractiveMapProps {
  className?: string;
  showSearch?: boolean;
  showControls?: boolean;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  apiKey?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  className = "",
  showSearch = true,
  showControls = true,
  initialCenter = { lat: 20.5937, lng: 78.9629 }, // Center of India
  initialZoom = 4,
  apiKey
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>(apiKey || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(!apiKey);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const markers = useRef<google.maps.Marker[]>([]);

  // Sample POI data for India
  const samplePOIs = [
    { name: "Taj Mahal", coordinates: { lat: 27.1751, lng: 78.0421 }, type: "heritage" },
    { name: "Gateway of India", coordinates: { lat: 18.9220, lng: 72.8347 }, type: "landmark" },
    { name: "Red Fort", coordinates: { lat: 28.6562, lng: 77.2410 }, type: "heritage" },
    { name: "Kaziranga National Park", coordinates: { lat: 26.5775, lng: 93.3712 }, type: "nature" },
    { name: "Shillong", coordinates: { lat: 25.5788, lng: 91.8933 }, type: "hill-station" },
    { name: "Tawang Monastery", coordinates: { lat: 27.5856, lng: 91.8622 }, type: "religious" },
    { name: "Majuli Island", coordinates: { lat: 27.0530, lng: 94.2037 }, type: "nature" },
  ];

  useEffect(() => {
    if (!mapContainer.current || !googleMapsApiKey) return;

    const loader = new Loader({
      apiKey: googleMapsApiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });

    loader.load().then(() => {
      if (!mapContainer.current) return;

      map.current = new google.maps.Map(mapContainer.current, {
        center: initialCenter,
        zoom: initialZoom,
        mapTypeControl: showControls,
        fullscreenControl: showControls,
        streetViewControl: showControls,
        zoomControl: showControls,
      });

      // Add POI markers
      samplePOIs.forEach((poi) => {
        const marker = new google.maps.Marker({
          position: poi.coordinates,
          map: map.current!,
          title: poi.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: poi.type === 'nature' ? '#22c55e' : 
                      poi.type === 'heritage' ? '#f59e0b' :
                      poi.type === 'religious' ? '#8b5cf6' : '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold">${poi.name}</h3>
              <p class="text-sm text-gray-600 capitalize">${poi.type.replace('-', ' ')}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map.current!, marker);
        });

        markers.current.push(marker);
      });

      setIsMapLoaded(true);
    }).catch((error) => {
      console.error('Error loading Google Maps:', error);
    });

    return () => {
      markers.current.forEach(marker => marker.setMap(null));
      markers.current = [];
    };
  }, [googleMapsApiKey, initialCenter, initialZoom, showControls]);

  const handleTokenSet = (token: string) => {
    setGoogleMapsApiKey(token);
    setShowTokenInput(false);
  };

  const handleSearch = () => {
    if (!searchQuery.trim() || !map.current) return;

    const service = new google.maps.places.PlacesService(map.current);
    const request = {
      query: searchQuery,
      fields: ['name', 'geometry']
    };

    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
        const place = results[0];
        if (place.geometry?.location) {
          map.current?.setCenter(place.geometry.location);
          map.current?.setZoom(12);
        }
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {showTokenInput && <GoogleMapsTokenInput onTokenSet={handleTokenSet} />}
      
      {!showTokenInput && showSearch && isMapLoaded && (
        <Card className="absolute top-4 left-4 z-10 p-2 bg-background/95 backdrop-blur">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-64"
            />
            <Button onClick={handleSearch} size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {!showTokenInput && isMapLoaded && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <Button variant="outline" size="sm" className="bg-background/95 backdrop-blur">
            <Layers className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="bg-background/95 backdrop-blur">
            <Navigation className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="bg-background/95 backdrop-blur">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {!isMapLoaded && !showTokenInput && (
        <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;