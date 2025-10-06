import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  initialWaypoints?: Waypoint[];
}

const RoutePlanner: React.FC<RoutePlannerProps> = ({ onRouteChange, googleMapsApiKey, initialWaypoints }) => {
  const { toast } = useToast();
  const [waypoints, setWaypoints] = useState<Waypoint[]>(
    initialWaypoints && initialWaypoints.length > 0 
      ? initialWaypoints 
      : [
          { id: 'start', name: '', lat: 0, lng: 0, type: 'start' },
          { id: 'end', name: '', lat: 0, lng: 0, type: 'end' }
        ]
  );
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

    console.log('Starting geocoding for:', query, waypointId);
    
    try {
      const { data, error } = await supabase.functions.invoke('geocoding', {
        body: { address: query }
      });
      
      console.log('Geocoding response:', { data, error });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (data && data.results && data.results.length > 0) {
        const result = data.results[0];
        const lat = result.geometry.location.lat;
        const lng = result.geometry.location.lng;
        
        console.log('Geocoding successful:', { lat, lng, address: result.formatted_address });
        
        setWaypoints(prev => prev.map(wp => 
          wp.id === waypointId 
            ? { ...wp, lat, lng, address: result.formatted_address, placeId: result.place_id }
            : wp
        ));
        
        toast({
          title: "Location Found",
          description: `Found: ${result.formatted_address}`,
        });
      } else {
        console.warn('No geocoding results found for:', query);
        throw new Error('No results found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: "Location Not Found",
        description: "Please try a more specific address or use the map picker.",
        variant: "destructive"
      });
    }
  };

  const calculateRoute = async () => {
    const validWaypoints = waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0);
    console.log('Calculating route with waypoints:', validWaypoints);
    
    if (validWaypoints.length < 2) {
      console.log('Not enough waypoints for route calculation');
      setRouteData({});
      return;
    }

    const start = validWaypoints.find(wp => wp.type === 'start');
    const end = validWaypoints.find(wp => wp.type === 'end');
    const intermediatePoints = validWaypoints.filter(wp => wp.type === 'waypoint');

    if (!start || !end) {
      console.log('Missing start or end waypoint');
      toast({
        title: "Missing Locations",
        description: "Please add both start and end locations",
        variant: "destructive"
      });
      return;
    }

    if (start.lat === 0 || start.lng === 0 || end.lat === 0 || end.lng === 0) {
      console.log('Invalid coordinates for start or end');
      return;
    }

    console.log('Route calculation:', { start, end, intermediatePoints });

    try {
      // Build request data for Supabase Edge Function
      const requestData: any = {
        origin: `${start.lat},${start.lng}`,
        destination: `${end.lat},${end.lng}`
      };

      if (intermediatePoints.length > 0) {
        requestData.waypoints = intermediatePoints.map(wp => `${wp.lat},${wp.lng}`).join('|');
      }

      console.log('Sending directions request:', requestData);

      const { data, error } = await supabase.functions.invoke('directions', {
        body: requestData
      });

      console.log('Directions response:', { data, error });

      if (error) {
        console.error('Directions function error:', error);
        throw new Error('Failed to connect to directions service');
      }

      if (!data) {
        throw new Error('No response from directions service');
      }

      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const totalDistance = route.legs.reduce((sum: number, leg: any) => sum + (leg.distance?.value || 0), 0);
        const totalDuration = route.legs.reduce((sum: number, leg: any) => sum + (leg.duration?.value || 0), 0);
        
        const newRouteData = {
          polyline: route.overview_polyline.points,
          distance: totalDistance / 1000, // Convert to km
          duration: totalDuration / 60, // Convert to minutes
          steps: route.legs.flatMap((leg: any) => leg.steps || []),
          coordinates: [start, ...intermediatePoints, end].map(wp => ({ lat: wp.lat, lng: wp.lng }))
        };
        
        console.log('Route calculated successfully:', newRouteData);
        
        setRouteData(newRouteData);
        onRouteChange(waypoints, newRouteData);
        
        toast({
          title: "Route Calculated",
          description: `${newRouteData.distance.toFixed(0)} km in ${Math.floor(newRouteData.duration / 60)}h ${Math.floor(newRouteData.duration % 60)}m`,
        });
      } else if (data.status === 'ZERO_RESULTS') {
        throw new Error('No route found between these locations. Try different destinations.');
      } else if (data.status === 'NOT_FOUND') {
        throw new Error('One or more locations could not be found.');
      } else if (data.status === 'INVALID_REQUEST') {
        throw new Error('Invalid route request. Please check your locations.');
      } else {
        console.error('Directions API error:', data);
        throw new Error(data.error_message || data.status || 'Unable to calculate route');
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      setRouteData({});
      toast({
        title: "Route Error",
        description: error instanceof Error ? error.message : "Failed to calculate route. Please try different locations.",
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
            const { data, error } = await supabase.functions.invoke('places-nearby', {
              body: {
                location: `${coord.lat},${coord.lng}`,
                radius: '10000',
                type
              }
            });
            
            if (!error && data.results) {
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

  // Sync with parent waypoints when they change externally (e.g., from map picker)
  useEffect(() => {
    if (initialWaypoints && initialWaypoints.length > 0) {
      // Check if initialWaypoints are different from current waypoints
      const isDifferent = JSON.stringify(initialWaypoints) !== JSON.stringify(waypoints);
      if (isDifferent) {
        console.log('Syncing waypoints from parent:', initialWaypoints);
        setWaypoints(initialWaypoints);
        
        // Trigger route calculation if we have valid start and end
        const hasStart = initialWaypoints.some(wp => wp.type === 'start' && wp.lat !== 0);
        const hasEnd = initialWaypoints.some(wp => wp.type === 'end' && wp.lat !== 0);
        
        if (hasStart && hasEnd) {
          console.log('Valid start and end found, will calculate route');
          // Route calculation will be triggered by the waypoints useEffect
        }
      }
    }
  }, [initialWaypoints]);

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
                          
                           <div className="flex-1 relative">
                             <PlacesAutocomplete
                               value={waypoint.name}
                               onChange={(newName) => {
                                 setWaypoints(prev => prev.map(wp => 
                                   wp.id === waypoint.id ? { ...wp, name: newName } : wp
                                 ));
                                 // Trigger debounced geocoding for manual input
                                 if (newName.trim() && newName.length > 2) {
                                   debounceGeocoding(newName, waypoint.id);
                                 }
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
                               className="border-0 bg-transparent focus:bg-background transition-colors pr-12"
                             />
                             
                             {/* Location status indicator */}
                             <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                               {waypoint.lat !== 0 && waypoint.lng !== 0 ? (
                                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                               ) : waypoint.name.trim() ? (
                                 <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                               ) : (
                                 <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                               )}
                             </div>
                             
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
                            className="text-primary hover:text-primary/80 hover:bg-primary/10"
                            title="Pick location on map"
                          >
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-xs hidden sm:inline">Pick</span>
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