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
}

interface RoutePlannerProps {
  onRouteChange: (waypoints: Waypoint[], routeData: RouteData) => void;
  mapboxToken: string;
}

const RoutePlanner: React.FC<RoutePlannerProps> = ({ onRouteChange, mapboxToken }) => {
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
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;
        
        setWaypoints(prev => prev.map(wp => 
          wp.id === waypointId 
            ? { ...wp, lat, lng, address: feature.place_name, placeId: feature.id }
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
      let coordinates = `${start.lng},${start.lat}`;
      intermediatePoints.forEach(wp => {
        coordinates += `;${wp.lng},${wp.lat}`;
      });
      coordinates += `;${end.lng},${end.lat}`;

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?access_token=${mapboxToken}&geometries=geojson&steps=true&overview=full`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const newRouteData = {
          polyline: route.geometry,
          distance: route.distance / 1000, // Convert to km
          duration: route.duration / 60, // Convert to minutes
          steps: route.legs.flatMap((leg: any) => leg.steps)
        };
        
        setRouteData(newRouteData);
        onRouteChange(waypoints, newRouteData);
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      toast({
        title: "Route Error",
        description: "Failed to calculate route. Please check your waypoints.",
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
    if (!result.destination) return;

    const reorderedWaypoints = Array.from(waypoints);
    const [removed] = reorderedWaypoints.splice(result.source.index, 1);
    reorderedWaypoints.splice(result.destination.index, 0, removed);

    setWaypoints(reorderedWaypoints);
  };

  const searchNearbyPOIs = async () => {
    if (!routeData.polyline || (!filters.fuel && !filters.food)) return;

    try {
      const types = [];
      if (filters.fuel) types.push('gas_station');
      if (filters.food) types.push('restaurant');

      // This is a simplified implementation - in production, you'd use a more sophisticated
      // method to find POIs along the route corridor
      const centerWaypoint = waypoints.find(wp => wp.type === 'waypoint') || waypoints.find(wp => wp.type === 'start');
      if (!centerWaypoint || centerWaypoint.lat === 0) return;

      const mockPOIs = types.flatMap(type => [
        {
          id: `${type}-1`,
          name: type === 'gas_station' ? 'Indian Oil Petrol Pump' : 'Highway Dhaba',
          type,
          lat: centerWaypoint.lat + (Math.random() - 0.5) * 0.1,
          lng: centerWaypoint.lng + (Math.random() - 0.5) * 0.1,
          rating: 4.2,
          distance: Math.floor(Math.random() * 50) + 5
        },
        {
          id: `${type}-2`,
          name: type === 'gas_station' ? 'HP Petrol Station' : 'Punjab Restaurant',
          type,
          lat: centerWaypoint.lat + (Math.random() - 0.5) * 0.1,
          lng: centerWaypoint.lng + (Math.random() - 0.5) * 0.1,
          rating: 4.5,
          distance: Math.floor(Math.random() * 50) + 5
        }
      ]);

      setNearbyPOIs(mockPOIs);
    } catch (error) {
      console.error('POI search error:', error);
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
                <Draggable key={waypoint.id} draggableId={waypoint.id} index={index}>
                  {(provided, snapshot) => (
                    <Card 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`group hover:border-primary/20 transition-colors ${
                        snapshot.isDragging ? 'shadow-lg' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          {waypoint.type === 'waypoint' && (
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            </div>
                          )}
                          
                          <div className={`w-4 h-4 rounded-full ${
                            waypoint.type === 'start' ? 'bg-primary' :
                            waypoint.type === 'end' ? 'bg-destructive' :
                            'bg-accent'
                          }`} />
                          
                          <div className="flex-1">
                            <Input
                              placeholder={
                                waypoint.type === 'start' ? 'Starting location (e.g., Delhi)' :
                                waypoint.type === 'end' ? 'End location (e.g., Shillong)' :
                                'Destination name'
                              }
                              value={waypoint.name}
                              onChange={(e) => {
                                const newName = e.target.value;
                                setWaypoints(prev => prev.map(wp => 
                                  wp.id === waypoint.id ? { ...wp, name: newName } : wp
                                ));
                                debounceGeocoding(newName, waypoint.id);
                              }}
                            />
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openMapPicker(waypoint.id)}
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                          
                          {waypoint.type === 'waypoint' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeWaypoint(waypoint.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
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
          mapboxToken={mapboxToken}
        />
      )}
    </div>
  );
};

export default RoutePlanner;