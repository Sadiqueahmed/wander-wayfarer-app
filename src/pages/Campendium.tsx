import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import MapCanvas from "@/components/planner/MapCanvas";
import RoutePlanner from "@/components/planner/RoutePlanner";
import DayByDay from "@/components/planner/DayByDay";
import ShareButton from "@/components/planner/ShareButton";
import ExportPdfButton from "@/components/planner/ExportPdfButton";
import { useItineraryStore } from "@/store/itineraryStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useTrips } from "@/hooks/useTrips";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Tent, 
  Car, 
  Wifi, 
  Zap, 
  Droplets,
  Trees,
  Mountain,
  Camera,
  Phone,
  Settings,
  List,
  Grid,
  Heart,
  Compass,
  Route,
  Calendar,
  Plus,
  Save,
  Share,
  Download,
  Navigation,
  Fuel,
  Utensils,
  Menu
} from "lucide-react";

const Campendium = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trips, createTrip } = useTrips();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState('explore');
  const [selectedCampground, setSelectedCampground] = useState(null);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [tripWaypoints, setTripWaypoints] = useState([]);
  
  // Itinerary store
  const {
    currentItinerary,
    filters: storeFilters,
    updateWaypoints,
    updateRouteData,
    updateDays,
    updateFilters,
    saveItinerary,
    createNewItinerary,
    updateShareSettings
  } = useItineraryStore();

  const mapboxToken = 'AIzaSyBbJbSHj4dI5igT0K5WPFISHYNJuVy48oE';

  // Initialize new itinerary when route planner is accessed
  useEffect(() => {
    if (activeSection === 'route-planner' && !currentItinerary) {
      createNewItinerary();
    }
  }, [activeSection, currentItinerary, createNewItinerary]);

  const campgrounds = [
    {
      id: 1,
      name: "Rishikesh River Camp",
      location: "Rishikesh, Uttarakhand",
      rating: 4.8,
      reviews: 156,
      price: "₹2,500/night",
      image: "/placeholder.svg",
      amenities: ["wifi", "power", "water", "restrooms"],
      type: "RV Park",
      coordinates: [78.2676, 30.0869]
    },
    {
      id: 2,
      name: "Spiti Valley Base Camp",
      location: "Spiti Valley, Himachal Pradesh",
      rating: 4.9,
      reviews: 89,
      price: "₹1,800/night",
      image: "/placeholder.svg",
      amenities: ["mountain-view", "photography", "trekking"],
      type: "Wilderness",
      coordinates: [78.0322, 32.2466]
    },
    {
      id: 3,
      name: "Kaziranga Eco Camp",
      location: "Kaziranga, Assam",
      rating: 4.7,
      reviews: 234,
      price: "₹3,200/night",
      image: "/placeholder.svg",
      amenities: ["wildlife", "nature", "guided-tours"],
      type: "National Park",
      coordinates: [93.3712, 26.5775]
    }
  ];

  const filters = [
    { label: "RV Parks", value: "rv-parks", icon: Car },
    { label: "Tent Camping", value: "tent-camping", icon: Tent },
    { label: "National Parks", value: "national-parks", icon: Trees },
    { label: "Mountain Views", value: "mountain-views", icon: Mountain },
    { label: "WiFi Available", value: "wifi", icon: Wifi },
    { label: "Electric Hookup", value: "electric", icon: Zap },
    { label: "Water Access", value: "water", icon: Droplets },
    { label: "Photography", value: "photography", icon: Camera }
  ];

  const amenityIcons = {
    wifi: Wifi,
    power: Zap,
    water: Droplets,
    restrooms: MapPin,
    "mountain-view": Mountain,
    photography: Camera,
    trekking: Mountain,
    wildlife: Trees,
    nature: Trees,
    "guided-tours": MapPin
  };

  const toggleFilter = (filterValue: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterValue) 
        ? prev.filter(f => f !== filterValue)
        : [...prev, filterValue]
    );
  };

  const sidebarItems = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'route-planner', label: 'Route Planner', icon: Route },
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    { id: 'my-trips', label: 'My Trips', icon: List },
    { id: 'start-trip', label: 'Start Trip', icon: Plus }
  ];

  const startNewTrip = async () => {
    try {
      const newTrip = await createTrip({
        title: "New Camping Trip",
        start_location: "",
        end_location: "",
        travelers: 2,
        status: 'draft'
      });
      
      setCurrentTrip(newTrip);
      setActiveSection('itinerary');
      toast({
        title: "Trip Started!",
        description: "Begin planning your camping adventure",
      });
    } catch (error) {
      console.error('Error starting trip:', error);
    }
  };

  const addStopToTrip = (campground: any) => {
    if (!currentTrip) {
      startNewTrip();
      return;
    }

    const newWaypoint = {
      name: campground.name,
      description: campground.location,
      coordinates: campground.coordinates,
      stop_order: tripWaypoints.length,
      waypoint_type: 'destination',
      estimated_cost: campground.price
    };

    setTripWaypoints(prev => [...prev, newWaypoint]);
    toast({
      title: "Stop Added!",
      description: `${campground.name} added to your trip`,
    });
  };

  const filteredCampgrounds = campgrounds.filter(campground => {
    const matchesSearch = campground.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campground.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const renderSidebarContent = () => {
    switch (activeSection) {
      case 'explore':
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">Explore Campgrounds</h2>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campgrounds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* View Controls */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Map
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div>
              <h3 className="font-semibold mb-3">Filters</h3>
              <div className="grid grid-cols-2 gap-2">
                {filters.map((filter) => {
                  const Icon = filter.icon;
                  const isSelected = selectedFilters.includes(filter.value);
                  return (
                    <Button
                      key={filter.value}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter(filter.value)}
                      className="justify-start h-auto p-2"
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      <span className="text-xs">{filter.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Campground List */}
            <div className="space-y-3">
              <h3 className="font-semibold">Campgrounds ({filteredCampgrounds.length})</h3>
              {filteredCampgrounds.map((campground) => (
                <Card key={campground.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedCampground(campground)}>
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <img
                        src={campground.image}
                        alt={campground.name}
                        className="w-16 h-16 rounded-lg object-cover bg-muted"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-sm truncate">{campground.name}</h4>
                            <p className="text-xs text-muted-foreground">{campground.location}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              addStopToTrip(campground);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-1 my-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{campground.rating}</span>
                          <span className="text-xs text-muted-foreground">({campground.reviews})</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {campground.type}
                          </Badge>
                          <span className="text-sm font-semibold text-primary">{campground.price}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'route-planner':
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Route Planner</h2>
              <div className="flex gap-2">
                {currentItinerary && (
                  <ShareButton 
                    itinerary={currentItinerary}
                    onShare={async (shareData) => {
                      updateShareSettings(shareData.isPublic, shareData.shareSlug);
                    }}
                  />
                )}
                {currentItinerary && (
                  <ExportPdfButton 
                    itinerary={currentItinerary}
                    mapboxToken={mapboxToken}
                  />
                )}
              </div>
            </div>
            
            <RoutePlanner 
              onRouteChange={(waypoints, routeData) => {
                updateWaypoints(waypoints);
                updateRouteData(routeData);
              }}
            />
            
            <Button 
              onClick={saveItinerary}
              className="w-full gradient-hero text-white"
              disabled={!currentItinerary?.waypoints?.length}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Route
            </Button>
          </div>
        );

      case 'itinerary':
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Day-by-Day Itinerary</h2>
              <div className="flex gap-2">
                {currentItinerary && (
                  <ShareButton 
                    itinerary={currentItinerary}
                    onShare={async (shareData) => {
                      updateShareSettings(shareData.isPublic, shareData.shareSlug);
                    }}
                  />
                )}
                {currentItinerary && (
                  <ExportPdfButton 
                    itinerary={currentItinerary}
                    mapboxToken={mapboxToken}
                  />
                )}
              </div>
            </div>

            {currentItinerary && currentItinerary.waypoints.length > 1 ? (
              <DayByDay
                waypoints={currentItinerary.waypoints}
                routeData={currentItinerary.routeData}
                onDaysChange={updateDays}
              />
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No route planned yet. Create a route first to generate your itinerary.
                </p>
                <Button 
                  onClick={() => setActiveSection('route-planner')} 
                  className="gradient-hero text-white"
                >
                  Plan Route
                </Button>
              </div>
            )}
          </div>
        );

      case 'my-trips':
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">My Trips</h2>
              <Button size="sm" onClick={() => navigate('/plan-trip')}>
                <Plus className="h-4 w-4 mr-1" />
                Plan New
              </Button>
            </div>

            <div className="space-y-3">
              {trips.length === 0 ? (
                <div className="text-center py-8">
                  <Route className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No saved trips yet</p>
                  <Button onClick={() => navigate('/plan-trip')} variant="outline">
                    Create Your First Trip
                  </Button>
                </div>
              ) : (
                trips.map((trip) => (
                  <Card key={trip.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">{trip.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {trip.start_location} → {trip.end_location}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(trip.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={trip.status === 'completed' ? 'default' : 'secondary'}>
                          {trip.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">{activeSection}</h2>
            <p className="text-muted-foreground">Content for {activeSection} section</p>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background w-full">
        <Header />
        
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Enhanced Sidebar - Smaller Width */}
          <Sidebar className="w-48">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel className="px-4 py-2">
                  <div className="flex items-center justify-between w-full">
                    <span>Campendium</span>
                    <SidebarTrigger />
                  </div>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="px-2">
                    {sidebarItems.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton 
                          asChild
                          className={activeSection === item.id ? 'bg-primary/10 text-primary' : ''}
                        >
                          <button 
                            onClick={() => {
                              if (item.id === 'start-trip') {
                                startNewTrip();
                              } else {
                                setActiveSection(item.id);
                              }
                            }}
                            className="flex items-center w-full"
                          >
                            <item.icon className="h-4 w-4 mr-3" />
                            {item.label}
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          {/* Content Area */}
          <div className="flex-1 flex">
            {/* Dynamic Sidebar Content */}
            <div className="w-96 bg-background border-r border-border overflow-y-auto">
              {renderSidebarContent()}
            </div>

            {/* Map Area */}
            <div className="flex-1 relative">
              {activeSection === 'route-planner' ? (
                <MapCanvas
                  waypoints={currentItinerary?.waypoints || []}
                  routeData={currentItinerary?.routeData || {}}
                  onWaypointDrag={(waypointId, lat, lng) => {
                    const updatedWaypoints = (currentItinerary?.waypoints || []).map(wp =>
                      wp.id === waypointId ? { ...wp, lat, lng } : wp
                    );
                    updateWaypoints(updatedWaypoints);
                  }}
                  showPOIs={true}
                  poiFilters={storeFilters}
                  className="h-full"
                />
              ) : (
                <MapCanvas
                  waypoints={[]}
                  routeData={{}}
                  className="h-full"
                />
              )}
              
              {/* Map Overlay Controls */}
              {selectedCampground && (
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <Card className="bg-background/95 backdrop-blur p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{selectedCampground.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedCampground.location}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{selectedCampground.rating}</span>
                          </div>
                          <span className="text-sm font-medium text-primary">{selectedCampground.price}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <Navigation className="h-4 w-4 mr-1" />
                          Directions
                        </Button>
                        <Button 
                          size="sm" 
                          className="gradient-hero text-white"
                          onClick={() => addStopToTrip(selectedCampground)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add to Trip
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Campendium;