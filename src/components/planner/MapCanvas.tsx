import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Plus, Phone, Navigation, Fuel, Utensils } from 'lucide-react';

interface POI {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
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
  polyline?: any;
  distance?: number;
  duration?: number;
  coordinates?: { lat: number; lng: number }[];
}

interface MapCanvasProps {
  waypoints: Waypoint[];
  routeData: RouteData;
  googleMapsApiKey: string;
  onWaypointDrag?: (waypointId: string, lat: number, lng: number) => void;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  isPickerMode?: boolean;
  className?: string;
  showPOIs?: boolean;
  poiFilters?: { fuel: boolean; food: boolean };
}

const MapCanvas: React.FC<MapCanvasProps> = ({
  waypoints,
  routeData,
  googleMapsApiKey,
  onWaypointDrag,
  onLocationSelect,
  isPickerMode = false,
  className = '',
  showPOIs = false,
  poiFilters = { fuel: false, food: false }
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [pois, setPois] = useState<POI[]>([]);

  // Sample POIs for demonstration
  const samplePOIs: POI[] = [
    {
      id: 'fuel-1',
      name: 'Indian Oil Petrol Pump',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      type: 'fuel',
      rating: 4.2,
      address: 'Connaught Place, New Delhi',
      isOpen: true
    },
    {
      id: 'food-1',
      name: 'Karim\'s Restaurant',
      coordinates: { lat: 28.6562, lng: 77.2315 },
      type: 'food',
      rating: 4.5,
      address: 'Jama Masjid, Old Delhi',
      isOpen: true
    },
    {
      id: 'fuel-2',
      name: 'HP Petrol Pump',
      coordinates: { lat: 30.3165, lng: 78.0322 },
      type: 'fuel',
      rating: 4.0,
      address: 'Dehradun, Uttarakhand'
    },
    {
      id: 'food-2',
      name: 'Garhwal Mandal Vikas',
      coordinates: { lat: 30.3165, lng: 78.0322 },
      type: 'food',
      rating: 4.3,
      address: 'ISBT, Dehradun'
    }
  ];

  const handleMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (!isPickerMode || !onLocationSelect || !e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    const geocoder = new google.maps.Geocoder();
    
    try {
      const result = await geocoder.geocode({ location: { lat, lng } });
      const address = result.results[0]?.formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      
      onLocationSelect({ lat, lng, address });
    } catch (error) {
      console.error('Geocoding failed:', error);
      onLocationSelect({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
    }
  }, [isPickerMode, onLocationSelect]);

  // Initialize map
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
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true,
        zoomControl: true,
      });

      directionsService.current = new google.maps.DirectionsService();
      directionsRenderer.current = new google.maps.DirectionsRenderer({
        draggable: !isPickerMode,
        polylineOptions: {
          strokeColor: '#ff6b35',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });

      directionsRenderer.current.setMap(map.current);

      if (isPickerMode && onLocationSelect) {
        map.current.addListener('click', handleMapClick);
      }

      setIsMapLoaded(true);
      setPois(samplePOIs);
    }).catch((error) => {
      console.error('Error loading Google Maps:', error);
    });

    return () => {
      markers.current.forEach(marker => marker.setMap(null));
      markers.current = [];
    };
  }, [googleMapsApiKey, isPickerMode, handleMapClick]);

  // Update markers when waypoints change
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    // Add new markers
    waypoints.forEach((waypoint, index) => {
      if (waypoint.lat === 0 && waypoint.lng === 0) return;

      const marker = new google.maps.Marker({
        position: { lat: waypoint.lat, lng: waypoint.lng },
        map: map.current!,
        title: waypoint.name || waypoint.type,
        draggable: !!onWaypointDrag && !isPickerMode,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 16,
          fillColor: waypoint.type === 'start' ? '#22c55e' : waypoint.type === 'end' ? '#ef4444' : '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        label: {
          text: waypoint.type === 'start' ? 'S' : waypoint.type === 'end' ? 'E' : String.fromCharCode(65 + index - 1),
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold'
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold">${waypoint.name || waypoint.type}</h3>
            <p class="text-sm text-gray-600">${waypoint.address || waypoint.type}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map.current!, marker);
      });

      // Add drag handler
      if (onWaypointDrag && !isPickerMode) {
        marker.addListener('dragend', () => {
          const position = marker.getPosition();
          if (position) {
            onWaypointDrag(waypoint.id, position.lat(), position.lng());
          }
        });
      }

      markers.current.push(marker);
    });

    // Fit map to markers if there are valid waypoints
    const validWaypoints = waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0);
    if (validWaypoints.length > 0 && !isPickerMode) {
      const bounds = new google.maps.LatLngBounds();
      validWaypoints.forEach(wp => bounds.extend({ lat: wp.lat, lng: wp.lng }));
      
      map.current.fitBounds(bounds);
    }
  }, [waypoints, isMapLoaded, onWaypointDrag, isPickerMode]);

  // Update route when routeData changes
  useEffect(() => {
    if (!map.current || !isMapLoaded || !directionsRenderer.current || !directionsService.current) return;

    if (routeData.coordinates && routeData.coordinates.length > 1) {
      const waypoints = routeData.coordinates.slice(1, -1).map(coord => ({
        location: coord,
        stopover: true
      }));

      const request: google.maps.DirectionsRequest = {
        origin: routeData.coordinates[0],
        destination: routeData.coordinates[routeData.coordinates.length - 1],
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING
      };

      directionsService.current.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.current?.setDirections(result);
        }
      });
    }
  }, [routeData, isMapLoaded]);

  // Update POI markers based on filters
  useEffect(() => {
    if (!map.current || !isMapLoaded || !showPOIs) return;

    // Remove existing POI markers
    const existingPOIMarkers = document.querySelectorAll('.poi-marker');
    existingPOIMarkers.forEach(marker => marker.remove());

    // Add filtered POI markers
    const filteredPOIs = pois.filter(poi => 
      (poiFilters?.fuel && poi.type === 'fuel') || 
      (poiFilters?.food && poi.type === 'food')
    );

    filteredPOIs.forEach(poi => {
      const marker = new google.maps.Marker({
        position: poi.coordinates,
        map: map.current!,
        title: poi.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: poi.type === 'fuel' ? '#f59e0b' : '#10b981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      marker.addListener('click', () => setSelectedPOI(poi));
    });
  }, [showPOIs, poiFilters, pois, isMapLoaded]);

  const addStopFromPOI = (poi: POI) => {
    // This would typically call a parent callback to add the POI as a waypoint
    console.log('Adding POI as stop:', poi);
    setSelectedPOI(null);
  };

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Loading overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* POI Info Card */}
      {selectedPOI && !isPickerMode && (
        <Card className="absolute bottom-4 left-4 right-4 p-4 bg-background/95 backdrop-blur z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {selectedPOI.type === 'fuel' ? 
                  <Fuel className="h-4 w-4 text-amber-500" /> : 
                  <Utensils className="h-4 w-4 text-emerald-500" />
                }
                <h3 className="font-semibold">{selectedPOI.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{selectedPOI.address}</p>
              <div className="flex items-center gap-4 mt-2">
                {selectedPOI.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{selectedPOI.rating}</span>
                  </div>
                )}
                <Badge variant={selectedPOI.isOpen ? "default" : "secondary"}>
                  {selectedPOI.isOpen ? "Open" : "Closed"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedPOI(null)}>
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
              <Button variant="outline" size="sm">
                <Navigation className="h-4 w-4 mr-1" />
                Directions
              </Button>
              <Button onClick={() => addStopFromPOI(selectedPOI)} className="gradient-hero text-white">
                <Plus className="h-4 w-4 mr-1" />
                Add Stop
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Picker mode instructions */}
      {isPickerMode && (
        <Card className="absolute top-4 left-4 right-4 p-3 bg-background/95 backdrop-blur z-10">
          <p className="text-sm text-center">
            Click on the map to select a location
          </p>
        </Card>
      )}
    </div>
  );
};

export default MapCanvas;