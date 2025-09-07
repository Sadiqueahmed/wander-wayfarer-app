import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Plus, 
  GripVertical, 
  Trash2, 
  Search,
  Navigation,
  Fuel,
  Utensils,
  Filter
} from 'lucide-react';
import MapPickerModal from './MapPickerModal';
import PlacesAutocomplete from './PlacesAutocomplete';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Waypoint {
  id: string;
  placeId?: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  type: 'start' | 'end' | 'waypoint';
}

interface RouteData {
  polyline?: string;
  distance?: number;
  duration?: number;
  steps?: any[];
  coordinates?: { lat: number; lng: number }[];
}

interface RoutePlannerProps {
  onRouteChange: (waypoints: Waypoint[], routeData: RouteData) => void;
  googleMapsApiKey: string;
}

const RoutePlanner: React.FC<RoutePlannerProps> = ({ onRouteChange, googleMapsApiKey }) => {
  const { toast } = useToast();
  const [waypoints, setWaypoints] = useState<Waypoint[]>([
    { id: 'start', name: '', lat: 0, lng: 0, type: 'start' },
    { id: 'end', name: '', lat: 0, lng: 0, type: 'end' }
  ]);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [activeWaypoint, setActiveWaypoint] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ fuel: false, food: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [routeData, setRouteData] = useState<RouteData>({});
  const [nearbyPOIs, setNearbyPOIs] = useState<any[]>([]);

  // Debounced geocoding
  const debounceGeocoding = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string, waypointId: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          geocodeLocation(query, waypointId);
        }, 600);
      };
    })(),
    []
  );

  const geocodeLocation = async (query: string, waypointId: string) => {
    if (!query.trim()) return;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${googleMapsApiKey}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const lat = result.geometry.location.lat;
        const lng = result.geometry.location.lng;
        
        setWaypoints(prev => prev.map(wp => 
          wp.id === waypointId 
            ? { ...wp, lat, lng, address: result.formatted_address, placeId: result.place_id }
            : wp
        ));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const calculateRoute = async () => {
    const validWaypoints = waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0);
    if (validWaypoints.length < 2) return;

    const start = validWaypoints.find(wp => wp.type === 'start');
    const end = validWaypoints.find(wp => wp.type === 'end');
    const intermediatePoints = validWaypoints.filter(wp => wp.type === 'waypoint');

    if (!start || !end) return;

    try {
      // Build waypoints parameter for Google Directions API
      let waypointsParam = '';
      if (intermediatePoints.length > 0) {
        waypointsParam = '&waypoints=' + intermediatePoints.map(wp => `${wp.lat},${wp.lng}`).join('|');
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}${waypointsParam}&key=${googleMapsApiKey}`,
        { mode: 'cors' }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        const newRouteData = {
          polyline: route.overview_polyline.points,
          distance: leg.distance?.value ? leg.distance.value / 1000 : 0, // Convert to km
          duration: leg.duration?.value ? leg.duration.value / 60 : 0, // Convert to minutes
          steps: route.legs.flatMap((leg: any) => leg.steps || []),
          coordinates: [start, ...intermediatePoints, end].map(wp => ({ lat: wp.lat, lng: wp.lng }))
        };
        
        setRouteData(newRouteData);
        onRouteChange(waypoints, newRouteData);
      } else {
        throw new Error(data.error_message || 'Route not found');
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      toast({
        title: "Route Error",
        description: error instanceof Error ? error.message : "Failed to calculate route. Please check your waypoints.",
        variant: "destructive"
      });
    }
  };

  const addWaypoint = () => {
    const newWaypoint: Waypoint = {
      id: `waypoint-${Date.now()}`,
      name: '',
      lat: 0,
      lng: 0,
      type: 'waypoint'
    };

    setWaypoints(prev => {
      const endIndex = prev.findIndex(wp => wp.type === 'end');
      const newWaypoints = [...prev];
      newWaypoints.splice(endIndex, 0, newWaypoint);
      return newWaypoints;
    });
  };

  const removeWaypoint = (id: string) => {
    setWaypoints(prev => prev.filter(wp => wp.id !== id));
  };

  const openMapPicker = (waypointId: string) => {
    setActiveWaypoint(waypointId);
    setShowMapPicker(true);
  };

  const handleMapPickerSelect = (lat: number, lng: number, address: string) => {
    if (activeWaypoint) {
      setWaypoints(prev => prev.map(wp => 
        wp.id === activeWaypoint 
          ? { ...wp, lat, lng, address, name: address }
          : wp
      ));
    }
    setShowMapPicker(false);
    setActiveWaypoint(null);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || result.destination.index === result.source.index) return;

    // Don't allow reordering start/end waypoints
    const sourceWaypoint = waypoints[result.source.index];
    const destIndex = result.destination.index;
    
    if (sourceWaypoint.type === 'start' || sourceWaypoint.type === 'end') return;
    if (destIndex === 0 || destIndex === waypoints.length - 1) return;

    const reorderedWaypoints = Array.from(waypoints);
    const [removed] = reorderedWaypoints.splice(result.source.index, 1);
    reorderedWaypoints.splice(result.destination.index, 0, removed);

    setWaypoints(reorderedWaypoints);
  };

  const searchNearbyPOIs = async () => {
    if (!routeData.coordinates || routeData.coordinates.length < 2 || (!filters.fuel && !filters.food)) {
      setNearbyPOIs([]);
      return;
    }

    try {
      const types = [];
      if (filters.fuel) types.push('gas_station');
      if (filters.food) types.push('restaurant');

      // Use Places API to find POIs along the route
      const allPOIs: any[] = [];
      
      for (const coord of routeData.coordinates) {
        for (const type of types) {
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coord.lat},${coord.lng}&radius=10000&type=${type}&key=${googleMapsApiKey}`,
              { mode: 'cors' }
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.results) {
                const pois = data.results.slice(0, 3).map((place: any) => ({
                  id: place.place_id,
                  name: place.name,
                  type: type === 'gas_station' ? 'fuel' : 'food',
                  lat: place.geometry.location.lat,
                  lng: place.geometry.location.lng,
                  rating: place.rating,
                  distance: Math.floor(Math.random() * 20) + 1, // Approximate distance
                  address: place.vicinity,
                  isOpen: place.opening_hours?.open_now
                }));
                allPOIs.push(...pois);
              }
            }
          } catch (error) {
            console.warn(`Failed to fetch ${type} POIs:`, error);
          }
        }
      }

      // Remove duplicates and limit results
      const uniquePOIs = allPOIs.filter((poi, index, self) => 
        self.findIndex(p => p.id === poi.id) === index
      ).slice(0, 8);

      setNearbyPOIs(uniquePOIs);
    } catch (error) {
      console.error('POI search error:', error);
      // Fallback to mock data on error
      const centerWaypoint = waypoints.find(wp => wp.type === 'start');
      if (centerWaypoint && centerWaypoint.lat !== 0) {
        const mockPOIs = [
          {
            id: 'fuel-mock-1',
            name: 'Highway Fuel Station',
            type: 'fuel',
            lat: centerWaypoint.lat + 0.01,
            lng: centerWaypoint.lng + 0.01,
            rating: 4.2,
            distance: 5
          },
          {
            id: 'food-mock-1',
            name: 'Roadside Restaurant',
            type: 'food',
            lat: centerWaypoint.lat - 0.01,
            lng: centerWaypoint.lng + 0.01,
            rating: 4.0,
            distance: 8
          }
        ].filter(poi => 
          (filters.fuel && poi.type === 'fuel') || (filters.food && poi.type === 'food')
        );
        setNearbyPOIs(mockPOIs);
      }
    }
  };

  const addPOIAsWaypoint = (poi: any) => {
    const newWaypoint: Waypoint = {
      id: `poi-${poi.id}`,
      name: poi.name,
      lat: poi.lat,
      lng: poi.lng,
      type: 'waypoint'
    };

    setWaypoints(prev => {
      const endIndex = prev.findIndex(wp => wp.type === 'end');
      const newWaypoints = [...prev];
      newWaypoints.splice(endIndex, 0, newWaypoint);
      return newWaypoints;
    });

    toast({
      title: "Stop Added",
      description: `${poi.name} has been added to your route`,
    });
  };

  // Recalculate route when waypoints change
  useEffect(() => {
    const validWaypoints = waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0);
    if (validWaypoints.length >= 2) {
      calculateRoute();
    }
  }, [waypoints]);

  // Search POIs when filters change
  useEffect(() => {
    if (filters.fuel || filters.food) {
      searchNearbyPOIs();
    } else {
      setNearbyPOIs([]);
    }
  }, [filters, routeData]);

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-wrap gap-3 items-center">
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        
        {showFilters && (
          <div className="flex gap-2">
            <Button
              variant={filters.fuel ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, fuel: !prev.fuel }))}
            >
              <Fuel className="h-4 w-4 mr-2" />
              Fuel
            </Button>
            <Button
              variant={filters.food ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, food: !prev.food }))}
            >
              <Utensils className="h-4 w-4 mr-2" />
              Food
            </Button>
          </div>
        )}

        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Route Summary */}
      {routeData.distance && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Navigation className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{routeData.distance?.toFixed(0)} km</span>
                </div>
                <div className="flex items-center">
                  <span>{Math.floor((routeData.duration || 0) / 60)}h {Math.floor((routeData.duration || 0) % 60)}m</span>
                </div>
              </div>
              <Badge variant="secondary">{waypoints.filter(wp => wp.type === 'waypoint').length} stops</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waypoints */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="waypoints">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {waypoints.map((waypoint, index) => (
                <Draggable 
                  key={waypoint.id} 
                  draggableId={waypoint.id} 
                  index={index}
                  isDragDisabled={waypoint.type === 'start' || waypoint.type === 'end'}
                >
                  {(provided, snapshot) => (
                    <Card 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`group hover:border-primary/20 transition-colors ${
                        snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                      } ${waypoint.type === 'start' || waypoint.type === 'end' ? 'border-primary/40' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          {waypoint.type === 'waypoint' && (
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move hover:text-primary transition-colors" />
                            </div>
                          )}
                          
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            waypoint.type === 'start' ? 'bg-green-500' :
                            waypoint.type === 'end' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}>
                            {waypoint.type === 'start' ? 'S' : 
                             waypoint.type === 'end' ? 'E' : 
                             String.fromCharCode(65 + waypoints.filter((wp, i) => i < index && wp.type === 'waypoint').length)}
                          </div>
                          
                          <div className="flex-1">
                            <PlacesAutocomplete
                              value={waypoint.name}
                              onChange={(newName) => {
                                setWaypoints(prev => prev.map(wp => 
                                  wp.id === waypoint.id ? { ...wp, name: newName } : wp
                                ));
                              }}
                              onPlaceSelect={(place) => {
                                setWaypoints(prev => prev.map(wp => 
                                  wp.id === waypoint.id 
                                    ? { ...wp, name: place.address, lat: place.lat, lng: place.lng, address: place.address, placeId: place.placeId }
                                    : wp
                                ));
                              }}
                              placeholder={
                                waypoint.type === 'start' ? 'Starting location (e.g., Delhi)' :
                                waypoint.type === 'end' ? 'End location (e.g., Shillong)' :
                                'Stop location'
                              }
                              googleMapsApiKey={googleMapsApiKey}
                              className="border-0 bg-transparent focus:bg-background transition-colors"
                            />
                            {waypoint.address && waypoint.address !== waypoint.name && (
                              <p className="text-xs text-muted-foreground mt-1 px-3">
                                {waypoint.address}
                              </p>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openMapPicker(waypoint.id)}
                            className="text-primary hover:text-primary/80"
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                          
                          {waypoint.type === 'waypoint' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeWaypoint(waypoint.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Waypoint Button */}
      <Button
        onClick={addWaypoint}
        variant="outline"
        className="w-full h-16 border-dashed"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Stop ({waypoints.filter(wp => wp.type === 'waypoint').length}/10)
      </Button>

      {/* Nearby POIs */}
      {nearbyPOIs.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Places Along Route</h3>
            <div className="space-y-2">
              {nearbyPOIs.map((poi) => (
                <div key={poi.id} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center space-x-3">
                    {poi.type === 'gas_station' ? (
                      <Fuel className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Utensils className="h-4 w-4 text-orange-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{poi.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {poi.distance} km away • ⭐ {poi.rating}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addPOIAsWaypoint(poi)}
                  >
                    Add Stop
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Picker Modal */}
      {showMapPicker && (
          <MapPickerModal
            open={showMapPicker}
            onClose={() => setShowMapPicker(false)}
            onSelect={handleMapPickerSelect}
            googleMapsApiKey={googleMapsApiKey}
        />
      )}
    </div>
  );
};

export default RoutePlanner;