import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Navigation, Layers, Settings } from 'lucide-react';

// Temporary Mapbox token input component
const MapboxTokenInput = ({ onTokenSet }: { onTokenSet: (token: string) => void }) => {
  // Auto-set the provided token
  const providedToken = 'pk.eyJ1Ijoic21va2V5IiwiYSI6ImNqa3d2N29pajAyMTkzcG1wZmczM2IwNDQifQ.NaHRdXWReFehBCY2l359Kg';
  
  const handleSetToken = () => {
    onTokenSet(providedToken);
  };
  
  return (
    <Card className="absolute top-4 left-4 right-4 z-10 p-4 bg-background/95 backdrop-blur">
      <div className="space-y-2">
        <h3 className="font-semibold">Mapbox Integration Ready</h3>
        <p className="text-sm text-muted-foreground">
          Your Mapbox token is configured and ready to use
        </p>
        <Button onClick={handleSetToken} className="w-full gradient-hero text-white">
          Initialize Map
        </Button>
      </div>
    </Card>
  );
};

interface InteractiveMapProps {
  className?: string;
  showSearch?: boolean;
  showControls?: boolean;
  initialCenter?: [number, number];
  initialZoom?: number;
  style?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  className = "",
  showSearch = true,
  showControls = true,
  initialCenter = [78.9629, 20.5937], // Center of India
  initialZoom = 4,
  style = 'mapbox://styles/mapbox/outdoors-v12'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('pk.eyJ1Ijoic21va2V5IiwiYSI6ImNqa3d2N29pajAyMTkzcG1wZmczM2IwNDQifQ.NaHRdXWReFehBCY2l359Kg');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Sample POI data for India
  const samplePOIs = [
    { name: "Taj Mahal", coordinates: [78.0421, 27.1751], type: "heritage" },
    { name: "Gateway of India", coordinates: [72.8347, 18.9220], type: "landmark" },
    { name: "Red Fort", coordinates: [77.2410, 28.6562], type: "heritage" },
    { name: "Kaziranga National Park", coordinates: [93.3712, 26.5775], type: "nature" },
    { name: "Shillong", coordinates: [91.8933, 25.5788], type: "hill-station" },
    { name: "Tawang Monastery", coordinates: [91.8622, 27.5856], type: "religious" },
    { name: "Majuli Island", coordinates: [94.2037, 27.0530], type: "nature" },
  ];

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: style,
      center: initialCenter,
      zoom: initialZoom,
    });

    // Add navigation controls
    if (showControls) {
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    }

    // Add POI markers
    map.current.on('load', () => {
      samplePOIs.forEach((poi) => {
        const marker = new mapboxgl.Marker({
          color: poi.type === 'nature' ? '#22c55e' : 
                 poi.type === 'heritage' ? '#f59e0b' :
                 poi.type === 'religious' ? '#8b5cf6' : '#3b82f6'
        })
          .setLngLat(poi.coordinates as [number, number])
          .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">${poi.name}</h3>
                <p class="text-sm text-gray-600 capitalize">${poi.type.replace('-', ' ')}</p>
              </div>
            `))
          .addTo(map.current!);
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, initialCenter, initialZoom, style, showControls]);

  const handleTokenSet = (token: string) => {
    setMapboxToken(token);
    setShowTokenInput(false);
  };

  const handleSearch = () => {
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className={`relative ${className}`}>
      {showTokenInput && <MapboxTokenInput onTokenSet={handleTokenSet} />}
      
      {!showTokenInput && showSearch && (
        <Card className="absolute top-4 left-4 z-10 p-2 bg-background/95 backdrop-blur">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Button onClick={handleSearch} size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {!showTokenInput && (
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
    </div>
  );
};

export default InteractiveMap;