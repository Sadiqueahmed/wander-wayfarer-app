import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Clock, Plus, ExternalLink } from 'lucide-react';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES } from '@/config/googleMaps';

interface POI {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'fuel' | 'food';
  rating?: number;
  address?: string;
  isOpen?: boolean;
}

interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'start' | 'end' | 'waypoint';
  address?: string;
}

interface RouteData {
  polyline?: string;
  distance?: number;
  duration?: number;
  coordinates?: { lat: number; lng: number }[];
}

interface MapCanvasProps {
  waypoints: Waypoint[];
  routeData: RouteData;
  onWaypointDrag?: (waypointId: string, lat: number, lng: number) => void;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  showPOIs?: boolean;
  poiFilters?: { fuel: boolean; food: boolean };
  isPickerMode?: boolean;
  className?: string;
}

const MapCanvas: React.FC<MapCanvasProps> = ({
  waypoints,
  routeData,
  onWaypointDrag,
  onLocationSelect,
  showPOIs = false,
  poiFilters = { fuel: false, food: false },
  isPickerMode = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const poiMarkersRef = useRef<google.maps.Marker[]>([]);
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [nearbyPOIs, setNearbyPOIs] = useState<POI[]>([]);
  const [pickerMarker, setPickerMarker] = useState<google.maps.Marker | null>(null);

  // Handle map clicks for location selection
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!isPickerMode || !e.latLng || !onLocationSelect || !map.current) return;
    
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    // Remove existing picker marker if any
    if (pickerMarker) {
      pickerMarker.setMap(null);
    }
    
    // Add a temporary marker at clicked location
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: map.current,
      animation: google.maps.Animation.DROP,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#FF6B00',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3
      },
      label: {
        text: '📍',
        fontSize: '20px'
      }
    });
    
    setPickerMarker(marker);
    
    // Reverse geocode to get address
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        onLocationSelect(lat, lng, results[0].formatted_address);
      } else {
        onLocationSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    });
  }, [isPickerMode, onLocationSelect, pickerMarker]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: GOOGLE_MAPS_LIBRARIES as any
    });

    loader.load().then(() => {
      if (!mapContainer.current) return;

      map.current = new google.maps.Map(mapContainer.current, {
        center: { lat: 20.5937, lng: 78.9629 }, // Center of India
        zoom: 5,
        mapTypeControl: true,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });

      directionsService.current = new google.maps.DirectionsService();
      directionsRenderer.current = new google.maps.DirectionsRenderer({
        draggable: true,
        suppressMarkers: true, // We'll add custom markers
        polylineOptions: {
          strokeColor: '#FF8C00',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });

      directionsRenderer.current.setMap(map.current);

      // Add map click listener
      map.current.addListener('click', handleMapClick);

      setIsMapLoaded(true);
    }).catch((error) => {
      console.error('Error loading Google Maps:', error);
    });

    // Cleanup on unmount
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      poiMarkersRef.current.forEach(marker => marker.setMap(null));
      if (pickerMarker) {
        pickerMarker.setMap(null);
      }
    };
  }, [handleMapClick]);

  // Update map markers when waypoints change
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const validWaypoints = waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0);
    
    validWaypoints.forEach((waypoint, index) => {
      const marker = new google.maps.Marker({
        position: { lat: waypoint.lat, lng: waypoint.lng },
        map: map.current!,
        title: waypoint.name,
        draggable: !!onWaypointDrag,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: waypoint.type === 'start' ? '#10B981' : 
                    waypoint.type === 'end' ? '#EF4444' : '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        },
        label: {
          text: waypoint.type === 'start' ? 'S' : 
                waypoint.type === 'end' ? 'E' : 
                String.fromCharCode(65 + validWaypoints.filter((wp, i) => i < index && wp.type === 'waypoint').length),
          color: '#FFFFFF',
          fontWeight: 'bold',
          fontSize: '12px'
        }
      });

      // Add drag listener
      if (onWaypointDrag) {
        marker.addListener('dragend', async (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          
          // Reverse geocode to get address
          const geocoder = new google.maps.Geocoder();
          try {
            const result = await geocoder.geocode({ location: { lat, lng } });
            const address = result.results[0]?.formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            onWaypointDrag(waypoint.id, lat, lng);
          } catch (error) {
            console.error('Reverse geocoding error:', error);
            onWaypointDrag(waypoint.id, lat, lng);
          }
        });
      }

      markersRef.current.push(marker);
    });

    // Fit bounds to show all waypoints
    if (validWaypoints.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      validWaypoints.forEach(wp => bounds.extend({ lat: wp.lat, lng: wp.lng }));
      map.current.fitBounds(bounds);
      
      // Ensure minimum zoom level
      google.maps.event.addListenerOnce(map.current, 'bounds_changed', () => {
        if (map.current && map.current.getZoom()! > 15) {
          map.current.setZoom(15);
        }
      });
    }
  }, [waypoints, isMapLoaded, onWaypointDrag]);

  // Update route display when route data changes
  useEffect(() => {
    if (!directionsRenderer.current || !routeData.polyline || !isMapLoaded) return;

    const validWaypoints = waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0);
    const start = validWaypoints.find(wp => wp.type === 'start');
    const end = validWaypoints.find(wp => wp.type === 'end');
    const intermediatePoints = validWaypoints.filter(wp => wp.type === 'waypoint');

    if (!start || !end) return;

    const request: google.maps.DirectionsRequest = {
      origin: { lat: start.lat, lng: start.lng },
      destination: { lat: end.lat, lng: end.lng },
      waypoints: intermediatePoints.map(wp => ({
        location: { lat: wp.lat, lng: wp.lng },
        stopover: true
      })),
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true
    };

    directionsService.current?.route(request, (result, status) => {
      if (status === 'OK' && result) {
        directionsRenderer.current?.setDirections(result);
      }
    });
  }, [routeData, waypoints, isMapLoaded]);

  // Handle POI display
  useEffect(() => {
    if (!map.current || !showPOIs || (!poiFilters.fuel && !poiFilters.food)) {
      // Clear POI markers
      poiMarkersRef.current.forEach(marker => marker.setMap(null));
      poiMarkersRef.current = [];
      setNearbyPOIs([]);
      return;
    }

    const validWaypoints = waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0);
    if (validWaypoints.length === 0) return;

    // Search for POIs near the route
    const placesService = new google.maps.places.PlacesService(map.current);
    const allPOIs: POI[] = [];

    validWaypoints.forEach((waypoint, index) => {
      const types = [];
      if (poiFilters.fuel) types.push('gas_station');
      if (poiFilters.food) types.push('restaurant');

      types.forEach(type => {
        const request = {
          location: { lat: waypoint.lat, lng: waypoint.lng },
          radius: 10000,
          type: type
        };

        placesService.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const pois = results.slice(0, 3).map(place => ({
              id: place.place_id!,
              name: place.name!,
              lat: place.geometry!.location!.lat(),
              lng: place.geometry!.location!.lng(),
              type: type === 'gas_station' ? 'fuel' as const : 'food' as const,
              rating: place.rating,
              address: place.vicinity,
              isOpen: place.opening_hours?.open_now
            }));

            allPOIs.push(...pois);
            setNearbyPOIs(prevPOIs => {
              const combined = [...prevPOIs, ...pois];
              // Remove duplicates
              const unique = combined.filter((poi, index, self) => 
                self.findIndex(p => p.id === poi.id) === index
              );
              return unique.slice(0, 10); // Limit to 10 POIs
            });

            // Add POI markers
            pois.forEach(poi => {
              const poiMarker = new google.maps.Marker({
                position: { lat: poi.lat, lng: poi.lng },
                map: map.current!,
                title: poi.name,
                icon: {
                  url: poi.type === 'fuel' ? 
                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgMThIMS41QzEuMjIzODYgMTggMSAxNy43NzYxIDEgMTcuNUMxIDE3LjIyMzkgMS4yMjM4NiAxNyAxLjUgMTdIM1YxOFpNMjIuNSAxN0gyMVYxOEgyMi41QzIyLjc3NjEgMTggMjMgMTcuNzc2MSAyMyAxNy41QzIzIDE3LjIyMzkgMjIuNzc2MSAxNyAyMi41IDE3WiIgZmlsbD0iIzMzNzNkYyIvPgo8L3N2Zz4K' :
                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyUzYuNDggMjIgMTIgMjJTMjIgMTcuNTIgMjIgMTJTMTcuNTIgMiAxMiAyWk0xMyAxN0g5VjE1SDEzVjE3Wk0xNSAxM0g5VjExSDE1VjEzWiIgZmlsbD0iI2Y1OTcwMyIvPgo8L3N2Zz4K',
                  scaledSize: new google.maps.Size(24, 24)
                }
              });

              poiMarker.addListener('click', () => {
                setSelectedPOI(poi);
              });

              poiMarkersRef.current.push(poiMarker);
            });
          }
        });
      });
    });
  }, [showPOIs, poiFilters, waypoints, isMapLoaded]);

  const addStopFromPOI = (poi: POI) => {
    if (onLocationSelect) {
      onLocationSelect(poi.lat, poi.lng, poi.name);
      setSelectedPOI(null);
    }
  };

  return (
    <div className="relative h-full">
      {/* Map Container */}
      <div className="w-full h-full rounded-lg overflow-hidden border">
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
      </div>

      {/* POI Info Card */}
      {selectedPOI && !isPickerMode && (
        <Card className="absolute top-4 right-4 w-80 z-10 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold">{selectedPOI.name}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPOI(null)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
            
            {selectedPOI.address && (
              <p className="text-sm text-muted-foreground mb-2">{selectedPOI.address}</p>
            )}
            
            <div className="flex items-center gap-2 mb-3">
              {selectedPOI.rating && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm">{selectedPOI.rating}</span>
                </div>
              )}
              
              {selectedPOI.isOpen !== undefined && (
                <Badge variant={selectedPOI.isOpen ? "default" : "secondary"}>
                  {selectedPOI.isOpen ? "Open" : "Closed"}
                </Badge>
              )}
              
              <Badge variant="outline">
                {selectedPOI.type === 'fuel' ? 'Fuel Station' : 'Restaurant'}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => addStopFromPOI(selectedPOI)}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add as Stop
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `https://www.google.com/maps/place/${selectedPOI.name}/@${selectedPOI.lat},${selectedPOI.lng}`;
                  window.open(url, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Picker Mode Instructions */}
      {isPickerMode && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary/90 backdrop-blur rounded-lg p-3 shadow-lg border border-primary-foreground/20">
          <div className="flex items-center text-sm text-primary-foreground font-medium">
            <MapPin className="h-5 w-5 mr-2 animate-pulse" />
            Click anywhere on the map to select your location 📍
          </div>
        </div>
      )}
    </div>
  );
};

export default MapCanvas;