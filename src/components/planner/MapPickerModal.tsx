import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, MapPin } from 'lucide-react';

interface MapPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number, address: string) => void;
  mapboxToken: string;
  initialCenter?: [number, number];
}

const MapPickerModal: React.FC<MapPickerModalProps> = ({
  open,
  onClose,
  onSelect,
  mapboxToken,
  initialCenter = [78.9629, 20.5937]
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  useEffect(() => {
    if (!open || !mapContainer.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCenter,
      zoom: 6,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add click handler
    map.current.on('click', async (e) => {
      const { lat, lng } = e.lngLat;
      
      // Remove existing marker
      if (marker.current) {
        marker.current.remove();
      }

      // Add new marker
      marker.current = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map.current!);

      // Reverse geocode
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&limit=1`
        );
        const data = await response.json();
        
        const address = data.features?.[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setSelectedLocation({ lat, lng, address });
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        setSelectedLocation({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [open, mapboxToken, initialCenter]);

  const searchLocation = async () => {
    if (!searchQuery.trim() || !map.current) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxToken}&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;
        
        // Fly to location
        map.current.flyTo({
          center: [lng, lat],
          zoom: 12,
          duration: 2000
        });

        // Remove existing marker
        if (marker.current) {
          marker.current.remove();
        }

        // Add new marker
        marker.current = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(map.current);

        setSelectedLocation({ lat, lng, address: feature.place_name });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelect(selectedLocation.lat, selectedLocation.lng, selectedLocation.address);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Pick Location on Map</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={searchLocation} variant="outline">
              Search
            </Button>
          </div>

          {/* Map Container */}
          <div className="flex-1 relative rounded-lg overflow-hidden border">
            <div ref={mapContainer} className="w-full h-full" />
            
            {/* Instructions overlay */}
            <div className="absolute top-4 left-4 bg-background/90 backdrop-blur rounded-lg p-3 shadow-lg">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                Click anywhere on the map to select a location
              </div>
            </div>
          </div>

          {/* Selected Location Info */}
          {selectedLocation && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Selected Location</h4>
              <p className="text-sm text-muted-foreground">{selectedLocation.address}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedLocation}
              className="gradient-hero text-white border-0"
            >
              Confirm Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapPickerModal;