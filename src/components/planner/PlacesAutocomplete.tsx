import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: { placeId: string; address: string; lat: number; lng: number }) => void;
  placeholder?: string;
  googleMapsApiKey: string;
  className?: string;
}

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Search for a location...",
  googleMapsApiKey,
  className
}) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    // Load Google Maps API if not already loaded
    const loadGoogleMaps = async () => {
      if (typeof window !== 'undefined' && !window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Google Maps API failed to load'));
          document.head.appendChild(script);
        });
      }

      if (window.google) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        
        // Create a dummy map element for PlacesService
        const mapDiv = document.createElement('div');
        const map = new window.google.maps.Map(mapDiv);
        placesService.current = new window.google.maps.places.PlacesService(map);
      }
    };

    loadGoogleMaps().catch(console.error);

    // Load recent searches from localStorage
    const stored = localStorage.getItem('recentLocationSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, [googleMapsApiKey]);

  const fetchPredictions = async (query: string) => {
    if (!autocompleteService.current || query.length < 2) {
      setPredictions([]);
      return;
    }

    const request = {
      input: query,
      componentRestrictions: { country: 'in' }, // Restrict to India
      types: ['geocode', 'establishment'],
      radius: 50000 // 50km radius for better results
    };

    autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        setPredictions(predictions);
        setShowPredictions(true);
        setSelectedIndex(-1);
      } else {
        setPredictions([]);
      }
    });
  };

  const getPlaceDetails = async (placeId: string, description: string) => {
    if (!placesService.current) return;

    const request = {
      placeId: placeId,
      fields: ['geometry', 'formatted_address', 'name']
    };

    placesService.current.getDetails(request, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || description;

        onPlaceSelect({ placeId, address, lat, lng });
        
        // Save to recent searches
        const newRecentSearches = [description, ...recentSearches.filter(s => s !== description)].slice(0, 5);
        setRecentSearches(newRecentSearches);
        localStorage.setItem('recentLocationSearches', JSON.stringify(newRecentSearches));
        
        setShowPredictions(false);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.trim()) {
      fetchPredictions(newValue);
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showPredictions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && predictions[selectedIndex]) {
          const prediction = predictions[selectedIndex];
          onChange(prediction.description);
          getPlaceDetails(prediction.place_id, prediction.description);
        }
        break;
      case 'Escape':
        setShowPredictions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handlePredictionClick = (prediction: Prediction) => {
    onChange(prediction.description);
    getPlaceDetails(prediction.place_id, prediction.description);
  };

  const handleRecentSearchClick = (search: string) => {
    onChange(search);
    fetchPredictions(search);
  };

  const handleFocus = () => {
    if (value.trim()) {
      fetchPredictions(value);
    } else if (recentSearches.length > 0) {
      setShowPredictions(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding to allow clicking on predictions
    setTimeout(() => setShowPredictions(false), 150);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn("pl-10", className)}
        />
      </div>

      {showPredictions && (predictions.length > 0 || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {predictions.length > 0 ? (
            <>
              {predictions.map((prediction, index) => (
                <button
                  key={prediction.place_id}
                  onClick={() => handlePredictionClick(prediction)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center space-x-3",
                    selectedIndex === index && "bg-muted"
                  )}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {prediction.structured_formatting.main_text}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  </div>
                </button>
              ))}
            </>
          ) : recentSearches.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center space-x-3"
                >
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 text-sm truncate">{search}</div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PlacesAutocomplete;