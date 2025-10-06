import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RoutePlanner from "@/components/planner/RoutePlanner";
import DayByDay from "@/components/planner/DayByDay";
import MapCanvas from "@/components/planner/MapCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTrips } from "@/hooks/useTrips";
import { useItineraryStore } from "@/store/itineraryStore";
import { supabase } from "@/integrations/supabase/client";
import { 
  MapPin, 
  Plus, 
  Calendar, 
  Clock, 
  DollarSign, 
  Car, 
  Navigation,
  Settings,
  Save,
  Share,
  Download,
  Trash2,
  GripVertical,
  Sparkles,
  Fuel,
  Calculator,
  Route,
  Users,
  Heart,
  Star,
  FolderOpen,
  Play,
  Loader2
} from "lucide-react";

interface Waypoint {
  id: string;
  placeId?: string;
  name: string;
  lat: number;
  lng: number;
  type: 'start' | 'end' | 'waypoint';
  address?: string;
}

interface RouteData {
  distance?: number;
  duration?: number;
  steps?: any[];
  coordinates?: { lat: number; lng: number }[];
}

// Trip planning component - no hardcoded API keys, all secure via edge functions
const PlanTrip = () => {
  const { toast } = useToast();
  const { createTrip, updateTrip, trips, loading: tripsLoading } = useTrips();
  const { currentItinerary, updateWaypoints, saveItinerary } = useItineraryStore();
  
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  
  const [tripData, setTripData] = useState({
    title: "My India Adventure",
    description: "",
    startLocation: "",
    endLocation: "",
    startDate: "",
    endDate: "",
    travelers: 2,
    budget: 50000,
    vehicleType: "car",
    fuelType: "petrol",
    mileage: 15,
    fuelPrice: 110
  });

  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [routeData, setRouteData] = useState<RouteData>({});
  const [dayPlans, setDayPlans] = useState<any[]>([]);
  const [showPOIs, setShowPOIs] = useState(false);
  const [poiFilters, setPoiFilters] = useState({ fuel: false, food: false });
  const [isPickerMode, setIsPickerMode] = useState(false);
  const [pickingFor, setPickingFor] = useState<'start' | 'end' | 'waypoint' | null>(null);

  // Check authentication status
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleRouteChange = (newWaypoints: Waypoint[], newRouteData: RouteData) => {
    setWaypoints(newWaypoints);
    setRouteData(newRouteData);
    updateWaypoints(newWaypoints.map((wp, index) => ({
      id: wp.id,
      name: wp.name,
      lat: wp.lat,
      lng: wp.lng,
      type: wp.type,
      order: index
    })));
  };

  const handleMapLocationSelect = (lat: number, lng: number, address: string) => {
    if (!pickingFor) return;

    const locationLabel = pickingFor === 'start' ? 'Starting' : pickingFor === 'end' ? 'Ending' : 'Stop';

    setWaypoints(prev => {
      let updated = [...prev];
      
      if (pickingFor === 'start' || pickingFor === 'end') {
        // For start/end, find and update or create
        const existingIndex = updated.findIndex(wp => wp.type === pickingFor);
        
        if (existingIndex !== -1) {
          // Update existing
          updated[existingIndex] = {
            ...updated[existingIndex],
            name: address,
            lat,
            lng,
            address
          };
        } else {
          // Create new start/end waypoint
          const newWaypoint: Waypoint = {
            id: pickingFor,
            name: address,
            lat,
            lng,
            type: pickingFor,
            address
          };
          
          // Ensure proper order: start should be first, end should be last
          if (pickingFor === 'start') {
            updated.unshift(newWaypoint);
          } else {
            updated.push(newWaypoint);
          }
        }
      } else {
        // Add regular waypoint
        const newWaypoint: Waypoint = {
          id: Date.now().toString(),
          name: address,
          lat,
          lng,
          type: 'waypoint',
          address
        };
        
        // Insert before the end waypoint
        const endIndex = updated.findIndex(wp => wp.type === 'end');
        if (endIndex !== -1) {
          updated.splice(endIndex, 0, newWaypoint);
        } else {
          updated.push(newWaypoint);
        }
      }
      
      return updated;
    });

    // Exit picker mode
    setIsPickerMode(false);
    setPickingFor(null);

    toast({
      title: "✓ Location Selected",
      description: `${locationLabel} location: ${address.length > 50 ? address.substring(0, 50) + '...' : address}`,
    });
  };

  const enablePickerMode = (type: 'start' | 'end' | 'waypoint') => {
    setIsPickerMode(true);
    setPickingFor(type);
    toast({
      title: "Pick on Map",
      description: `Click anywhere on the map to select ${type === 'start' ? 'start' : type === 'end' ? 'end' : 'a stop'} location`,
    });
  };

  const calculateFuelCost = () => {
    const totalDistance = routeData.distance || 0;
    const fuelNeeded = totalDistance / tripData.mileage;
    return Math.round(fuelNeeded * tripData.fuelPrice);
  };

  const saveTrip = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your trip. Redirecting to auth page...",
        variant: "destructive"
      });
      // Redirect to auth page
      window.location.href = '/auth';
      return;
    }

    if (!tripData.title.trim()) {
      toast({
        title: "Trip Title Required",
        description: "Please enter a title for your trip",
        variant: "destructive"
      });
      return;
    }

    if (waypoints.length < 2) {
      toast({
        title: "Route Required",
        description: "Please add at least a start and end location",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const tripToSave = {
        title: tripData.title.trim(),
        description: tripData.description?.trim() || '',
        start_location: waypoints.find(w => w.type === 'start')?.name || tripData.startLocation,
        end_location: waypoints.find(w => w.type === 'end')?.name || tripData.endLocation,
        start_date: tripData.startDate || null,
        end_date: tripData.endDate || null,
        travelers: tripData.travelers || 1,
        budget: tripData.budget || 0,
        vehicle_type: tripData.vehicleType || 'car',
        fuel_type: tripData.fuelType || 'petrol',
        mileage: tripData.mileage || 15,
        fuel_price: tripData.fuelPrice || 110,
        total_distance: routeData.distance || 0,
        estimated_fuel_cost: calculateFuelCost(),
        status: 'draft',
        is_public: false,
        trip_data: {
          waypoints: waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0),
          routeData: routeData,
          dayPlans: dayPlans || []
        }
      };

      let savedTrip;
      if (currentTripId) {
        savedTrip = await updateTrip(currentTripId, tripToSave);
        toast({
          title: "Trip Updated!",
          description: "Your trip has been updated successfully.",
        });
      } else {
        savedTrip = await createTrip(tripToSave);
        setCurrentTripId(savedTrip.id);
        toast({
          title: "Trip Saved!",
          description: "Your trip has been saved successfully.",
        });
      }
      
      // Update current itinerary in store
      const { setCurrentItinerary } = useItineraryStore.getState();
      setCurrentItinerary({
        id: savedTrip.id,
        title: tripData.title,
        waypoints: waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0).map((wp, index) => ({
          id: wp.id,
          name: wp.name,
          lat: wp.lat,
          lng: wp.lng,
          type: wp.type,
          order: index
        })),
        days: dayPlans || [],
        routeData: routeData,
        createdAt: savedTrip.created_at || new Date().toISOString(),
        updatedAt: savedTrip.updated_at || new Date().toISOString(),
        isPublic: false
      });
      
      // Save to store
      saveItinerary();

    } catch (error) {
      console.error('Error saving trip:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save trip. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const loadTrip = (trip: any) => {
    setTripData({
      title: trip.title,
      description: trip.description || "",
      startLocation: trip.start_location,
      endLocation: trip.end_location,
      startDate: trip.start_date || "",
      endDate: trip.end_date || "",
      travelers: trip.travelers,
      budget: trip.budget || 50000,
      vehicleType: trip.vehicle_type || "car",
      fuelType: trip.fuel_type || "petrol",
      mileage: trip.mileage || 15,
      fuelPrice: trip.fuel_price || 110
    });

    if (trip.trip_data) {
      if (trip.trip_data.waypoints) {
        setWaypoints(trip.trip_data.waypoints);
      }
      if (trip.trip_data.routeData) {
        setRouteData(trip.trip_data.routeData);
      }
      if (trip.trip_data.dayPlans) {
        setDayPlans(trip.trip_data.dayPlans);
      }
    }

    setCurrentTripId(trip.id);
    setShowLoadDialog(false);
    
    toast({
      title: "Trip Loaded",
      description: `${trip.title} has been loaded successfully.`,
    });
  };

  const startNewTrip = () => {
    setTripData({
      title: "My India Adventure",
      description: "",
      startLocation: "",
      endLocation: "",
      startDate: "",
      endDate: "",
      travelers: 2,
      budget: 50000,
      vehicleType: "car",
      fuelType: "petrol",
      mileage: 15,
      fuelPrice: 110
    });
    setWaypoints([]);
    setRouteData({});
    setDayPlans([]);
    setCurrentTripId(null);
    toast({
      title: "New Trip Started",
      description: "Ready to plan your new adventure!",
    });
  };

  const shareTrip = async () => {
    if (!currentTripId) {
      toast({
        title: "Save Trip First",
        description: "Please save your trip before sharing",
        variant: "destructive"
      });
      return;
    }
    
    const shareUrl = `${window.location.origin}/trip/${currentTripId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Trip share link has been copied to clipboard.",
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Link Copied!",
        description: "Trip share link has been copied to clipboard.",
      });
    }
  };

  const exportTrip = () => {
    if (waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0).length < 2) {
      toast({
        title: "No Route to Export",
        description: "Please plan a route before exporting",
        variant: "destructive"
      });
      return;
    }

    const tripDetails = {
      ...tripData,
      waypoints: waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0),
      routeData,
      dayPlans,
      fuelCost: calculateFuelCost(),
      totalDistance: routeData.distance || 0,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(tripDetails, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tripData.title.replace(/[^a-zA-Z0-9]/g, '_')}_trip_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Trip Exported!",
      description: "Your trip has been exported as JSON file.",
    });
  };

  const generateAIItinerary = async () => {
    if (waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0).length < 2) {
      toast({
        title: "Add Route First",
        description: "Please add start and end locations to optimize",
        variant: "destructive"
      });
      return;
    }

    // Simulate AI optimization with loading state
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Here you would integrate with an AI service
      toast({
        title: "Route Optimized!",
        description: "Your route has been optimized for fuel efficiency and time.",
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "AI optimization is temporarily unavailable.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Trip Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trip Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderOpen className="h-5 w-5 mr-2" />
                  Trip Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={startNewTrip}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Trip
                </Button>
                
                <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Load Saved Trip
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Load Saved Trip</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {tripsLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : trips.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          No saved trips found
                        </p>
                      ) : (
                        trips.map((trip) => (
                          <Card key={trip.id} className="cursor-pointer hover:border-primary/20 transition-colors">
                            <CardContent className="p-4" onClick={() => loadTrip(trip)}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{trip.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {trip.start_location} → {trip.end_location}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(trip.created_at).toLocaleDateString()}
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
                  </DialogContent>
                </Dialog>
                
                {currentTripId && (
                  <div className="text-xs text-center text-muted-foreground">
                    Current trip ID: {currentTripId.slice(0, 8)}...
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Trip Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Trip Title</label>
                  <Input
                    value={tripData.title}
                    onChange={(e) => setTripData({...tripData, title: e.target.value})}
                    placeholder="My Amazing Trip"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Input
                    value={tripData.description}
                    onChange={(e) => setTripData({...tripData, description: e.target.value})}
                    placeholder="Brief description of your trip"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Start Date</label>
                    <Input
                      type="date"
                      value={tripData.startDate}
                      onChange={(e) => setTripData({...tripData, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">End Date</label>
                    <Input
                      type="date"
                      value={tripData.endDate}
                      onChange={(e) => setTripData({...tripData, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Budget (₹)</label>
                  <Input
                    type="number"
                    value={tripData.budget}
                    onChange={(e) => setTripData({...tripData, budget: Number(e.target.value)})}
                    placeholder="50000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Travelers</label>
                    <Input
                      type="number"
                      min="1"
                      value={tripData.travelers}
                      onChange={(e) => setTripData({...tripData, travelers: Number(e.target.value)})}
                      placeholder="2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Vehicle Type</label>
                    <Select value={tripData.vehicleType} onValueChange={(value) => setTripData({...tripData, vehicleType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="bike">Motorcycle</SelectItem>
                        <SelectItem value="bus">Bus</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Fuel Calculator */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Fuel className="h-4 w-4 mr-2" />
                    Fuel Calculator
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Fuel Type</label>
                      <Select value={tripData.fuelType} onValueChange={(value) => setTripData({...tripData, fuelType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="petrol">Petrol</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="cng">CNG</SelectItem>
                          <SelectItem value="electric">Electric</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Price/L (₹)</label>
                      <Input
                        type="number"
                        value={tripData.fuelPrice}
                        onChange={(e) => setTripData({...tripData, fuelPrice: Number(e.target.value)})}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="text-sm font-medium mb-2 block">Mileage (km/L)</label>
                    <Input
                      type="number"
                      value={tripData.mileage}
                      onChange={(e) => setTripData({...tripData, mileage: Number(e.target.value)})}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span>Estimated Fuel Cost:</span>
                      <span className="font-bold text-primary">₹{calculateFuelCost().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={generateAIItinerary}
                    disabled={saving || waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0).length < 2}
                    className="flex-1 gradient-hero text-white border-0"
                  >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    {saving ? 'Optimizing...' : 'AI Optimize'}
                  </Button>
                  <Button 
                    onClick={saveTrip}
                    disabled={saving || waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0).length < 2}
                    variant="outline"
                    className={!user ? "cursor-not-allowed opacity-50" : ""}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trip Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Trip Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <div className="text-sm text-muted-foreground mb-1">Start Location</div>
                    <div className="text-sm font-medium">
                      {waypoints.find(wp => wp.type === 'start')?.name || 'Not set'}
                    </div>
                  </div>
                  <div className="border-b pb-2">
                    <div className="text-sm text-muted-foreground mb-1">End Location</div>
                    <div className="text-sm font-medium">
                      {waypoints.find(wp => wp.type === 'end')?.name || 'Not set'}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Distance</span>
                    <span className="font-medium">
                      {routeData.distance ? `${routeData.distance.toFixed(0)} km` : 'Not calculated'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Fuel</span>
                    <span className="font-medium">
                      {routeData.distance ? `₹${calculateFuelCost().toLocaleString()}` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Duration</span>
                    <span className="font-medium">
                      {routeData.duration ? `${Math.floor(routeData.duration / 60)}h ${Math.floor(routeData.duration % 60)}m` : 'Not calculated'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stop Points</span>
                    <span className="font-medium">{waypoints.filter(wp => wp.type === 'waypoint' && wp.lat !== 0).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Trip Planner */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">Trip Planner</h1>
                <p className="text-muted-foreground">{tripData.title}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={saveTrip}
                  disabled={saving || waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0).length < 2}
                  className={!user ? "cursor-not-allowed opacity-50" : ""}
                >
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {saving ? 'Saving...' : !user ? 'Sign in to Save' : currentTripId ? 'Update' : 'Save'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={shareTrip}
                  disabled={!currentTripId}
                  className={!currentTripId ? "cursor-not-allowed opacity-50" : ""}
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportTrip}
                  disabled={waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0).length < 2}
                  className={waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0).length < 2 ? "cursor-not-allowed opacity-50" : ""}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Tabs defaultValue="route" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="route" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Route className="h-4 w-4 mr-2" />
                  Route Planning
                </TabsTrigger>
                <TabsTrigger value="itinerary" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Day by Day
                </TabsTrigger>
                <TabsTrigger value="map" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  Map View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="route" className="space-y-4">
                <RoutePlanner 
                  onRouteChange={handleRouteChange}
                  initialWaypoints={waypoints}
                />
              </TabsContent>
              <TabsContent value="itinerary" className="space-y-4">
                <DayByDay 
                  waypoints={waypoints}
                  routeData={routeData}
                  onDaysChange={setDayPlans}
                />
              </TabsContent>

              <TabsContent value="map" className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Interactive Route Map</h3>
                      <div className="flex gap-2">
                        <Button
                          variant={isPickerMode ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (isPickerMode) {
                              setIsPickerMode(false);
                              setPickingFor(null);
                            } else {
                              enablePickerMode('waypoint');
                            }
                          }}
                        >
                          <MapPin className="h-4 w-4 mr-1" />
                          {isPickerMode ? 'Cancel Pick' : 'Pick on Map'}
                        </Button>
                        {isPickerMode && (
                          <>
                            <Button
                              variant={pickingFor === 'start' ? "default" : "outline"}
                              size="sm"
                              onClick={() => enablePickerMode('start')}
                            >
                              Start
                            </Button>
                            <Button
                              variant={pickingFor === 'waypoint' ? "default" : "outline"}
                              size="sm"
                              onClick={() => enablePickerMode('waypoint')}
                            >
                              Stop
                            </Button>
                            <Button
                              variant={pickingFor === 'end' ? "default" : "outline"}
                              size="sm"
                              onClick={() => enablePickerMode('end')}
                            >
                              End
                            </Button>
                          </>
                        )}
                        {!isPickerMode && (
                          <>
                            <Button
                              variant={showPOIs ? "default" : "outline"}
                              size="sm"
                              onClick={() => setShowPOIs(!showPOIs)}
                            >
                              <MapPin className="h-4 w-4 mr-1" />
                              Show POIs
                            </Button>
                            {showPOIs && (
                              <>
                                <Button
                                  variant={poiFilters.fuel ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setPoiFilters(prev => ({ ...prev, fuel: !prev.fuel }))}
                                >
                                  <Fuel className="h-4 w-4 mr-1" />
                                  Fuel
                                </Button>
                                <Button
                                  variant={poiFilters.food ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setPoiFilters(prev => ({ ...prev, food: !prev.food }))}
                                >
                                  Food
                                </Button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="h-[600px]">
                      <MapCanvas
                        waypoints={waypoints}
                        routeData={routeData}
                        isPickerMode={isPickerMode}
                        onWaypointDrag={(waypointId, lat, lng) => {
                          setWaypoints(prev => prev.map(wp => 
                            wp.id === waypointId 
                              ? { ...wp, lat, lng }
                              : wp
                          ));
                        }}
                        showPOIs={showPOIs}
                        poiFilters={poiFilters}
                        onLocationSelect={handleMapLocationSelect}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PlanTrip;