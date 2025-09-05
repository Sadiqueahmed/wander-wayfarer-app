import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InteractiveMap from "@/components/InteractiveMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  Star
} from "lucide-react";

const PlanTrip = () => {
  const { toast } = useToast();
  const [tripData, setTripData] = useState({
    title: "My India Adventure",
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

  const [waypoints, setWaypoints] = useState([
    { id: 1, name: "Red Fort, Delhi", time: "2 hours", cost: "₹30" },
    { id: 2, name: "Kaziranga National Park", time: "1 day", cost: "₹1,500" },
    { id: 3, name: "Shillong Peak", time: "3 hours", cost: "Free" }
  ]);

  const addWaypoint = () => {
    const newWaypoint = {
      id: waypoints.length + 1,
      name: "",
      time: "",
      cost: ""
    };
    setWaypoints([...waypoints, newWaypoint]);
  };

  const removeWaypoint = (id: number) => {
    setWaypoints(waypoints.filter(wp => wp.id !== id));
  };

  const calculateFuelCost = () => {
    const totalDistance = 2847; // This would be calculated from route
    const fuelNeeded = totalDistance / tripData.mileage;
    return Math.round(fuelNeeded * tripData.fuelPrice);
  };

  const saveTrip = () => {
    toast({
      title: "Trip Saved!",
      description: "Your trip has been saved successfully.",
    });
  };

  const shareTrip = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "Trip link has been copied to clipboard.",
    });
  };

  const exportTrip = () => {
    const tripDetails = {
      ...tripData,
      waypoints,
      fuelCost: calculateFuelCost(),
      totalDistance: 2847
    };
    
    const dataStr = JSON.stringify(tripDetails, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tripData.title.replace(/\s+/g, '_')}_trip.json`;
    link.click();
    
    toast({
      title: "Trip Exported!",
      description: "Your trip has been exported as JSON file.",
    });
  };

  const generateAIItinerary = () => {
    toast({
      title: "AI Itinerary Generated!",
      description: "Smart recommendations have been added to your trip.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Trip Settings */}
          <div className="lg:col-span-1 space-y-6">
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

                <div>
                  <label className="text-sm font-medium mb-2 block">Vehicle Type</label>
                  <select
                    value={tripData.vehicleType}
                    onChange={(e) => setTripData({...tripData, vehicleType: e.target.value})}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="car">Car</option>
                    <option value="bike">Motorcycle</option>
                    <option value="bus">Bus</option>
                    <option value="train">Train</option>
                  </select>
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
                      <select
                        value={tripData.fuelType}
                        onChange={(e) => setTripData({...tripData, fuelType: e.target.value})}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="cng">CNG</option>
                      </select>
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

                <Button 
                  onClick={generateAIItinerary}
                  className="w-full gradient-hero text-white border-0"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Itinerary
                </Button>
              </CardContent>
            </Card>

            {/* Trip Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Trip Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Distance</span>
                    <span className="font-medium">2,847 km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Fuel</span>
                    <span className="font-medium">₹{calculateFuelCost().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Duration</span>
                    <span className="font-medium">7 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Waypoints</span>
                    <span className="font-medium">{waypoints.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Trip Planner */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Trip Planner</h1>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={saveTrip}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={shareTrip}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" onClick={exportTrip}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Tabs defaultValue="route" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="route">Route Planning</TabsTrigger>
                <TabsTrigger value="itinerary">Day by Day</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
              </TabsList>

              <TabsContent value="route" className="space-y-4">
                {/* Start Location */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full bg-primary"></div>
                      <div className="flex-1">
                        <Input
                          placeholder="Starting location (e.g., Delhi)"
                          value={tripData.startLocation}
                          onChange={(e) => setTripData({...tripData, startLocation: e.target.value})}
                        />
                      </div>
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                {/* Waypoints */}
                {waypoints.map((waypoint, index) => (
                  <Card key={waypoint.id} className="group hover:border-primary/20 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                        <div className="w-4 h-4 rounded-full bg-accent"></div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            placeholder="Destination name"
                            value={waypoint.name}
                            className="col-span-2"
                          />
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{waypoint.time}</Badge>
                            <Badge variant="outline">{waypoint.cost}</Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWaypoint(waypoint.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add Waypoint Button */}
                <Button
                  onClick={addWaypoint}
                  variant="outline"
                  className="w-full h-16 border-dashed"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Stop ({waypoints.length}/100)
                </Button>

                {/* End Location */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full bg-destructive"></div>
                      <div className="flex-1">
                        <Input
                          placeholder="End location (e.g., Shillong)"
                          value={tripData.endLocation}
                          onChange={(e) => setTripData({...tripData, endLocation: e.target.value})}
                        />
                      </div>
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="itinerary" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Day-by-Day Itinerary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {[1, 2, 3, 4, 5].map((day) => (
                        <div key={day} className="border-l-2 border-primary pl-4">
                          <h3 className="font-semibold text-lg mb-2">Day {day}</h3>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">9:00 AM - Start from Delhi</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Navigation className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">350 km drive to Kaziranga</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Estimated cost: ₹2,500</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="map" className="space-y-4">
                <Card>
                  <CardContent className="p-0">
                    <div className="h-96 rounded-lg overflow-hidden">
                      <InteractiveMap 
                        className="h-full"
                        showSearch={true}
                        showControls={true}
                        initialCenter={{ lat: 20.5937, lng: 78.9629 }}
                        initialZoom={5}
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