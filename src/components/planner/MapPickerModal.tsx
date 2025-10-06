import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin } from 'lucide-react';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES } from '@/config/googleMaps';

interface MapPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number, address: string) => void;
  initialCenter?: { lat: number; lng: number };
}

const MapPickerModal: React.FC<MapPickerModalProps> = ({
  open,
  onClose,
  onSelect,
  initialCenter = { lat: 20.5937, lng: 78.9629 }
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (!open || !mapContainer.current) return;

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: GOOGLE_MAPS_LIBRARIES as any
    });

    loader.load().then(() => {
      if (!mapContainer.current) return;

      map.current = new google.maps.Map(mapContainer.current, {
        center: initialCenter,
        zoom: 6,
        mapTypeControl: true,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
      });

      // Add click handler
      map.current.addListener('click', async (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        
        // Remove existing marker
        if (marker.current) {
          marker.current.setMap(null);
        }

        // Add new marker
        marker.current = new google.maps.Marker({
          position: { lat, lng },
          map: map.current!,
          title: 'Selected Location'
        });

        // Reverse geocode
        const geocoder = new google.maps.Geocoder();
        
        try {
          const result = await geocoder.geocode({ location: { lat, lng } });
          const address = result.results[0]?.formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setSelectedLocation({ lat, lng, address });
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          setSelectedLocation({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        }
      });

      setIsMapLoaded(true);
    }).catch((error) => {
      console.error('Error loading Google Maps:', error);
    });

    return () => {
      if (marker.current) {
        marker.current.setMap(null);
      }
    };
  }, [open, initialCenter]);

  const searchLocation = async () => {
    if (!searchQuery.trim() || !map.current) return;

    const service = new google.maps.places.PlacesService(map.current);
    const request = {
      query: searchQuery,
      fields: ['name', 'geometry', 'formatted_address']
    };

    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
        const place = results[0];
        if (place.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          // Center map on location
          map.current?.setCenter({ lat, lng });
          map.current?.setZoom(12);

          // Remove existing marker
          if (marker.current) {
            marker.current.setMap(null);
          }

          // Add new marker
          marker.current = new google.maps.Marker({
            position: { lat, lng },
            map: map.current!,
            title: place.name
          });

          setSelectedLocation({ 
            lat, 
            lng, 
            address: place.formatted_address || place.name || `${lat.toFixed(4)}, ${lng.toFixed(4)}` 
          });
        }
      }
    });
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
            
            {/* Loading overlay */}
            {!isMapLoaded && (
              <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading map...</p>
                </div>
              </div>
            )}
            
            {/* Instructions overlay */}
            {isMapLoaded && (
              <div className="absolute top-4 left-4 bg-background/90 backdrop-blur rounded-lg p-3 shadow-lg">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  Click anywhere on the map to select a location
                </div>
              </div>
            )}
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