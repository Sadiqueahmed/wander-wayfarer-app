import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  Sparkles
} from "lucide-react";

const PlanTrip = () => {
  const [tripData, setTripData] = useState({
    title: "My India Adventure",
    startLocation: "",
    endLocation: "",
    startDate: "",
    endDate: "",
    travelers: 2,
    budget: 50000,
    vehicleType: "car"
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

  const generateAIItinerary = () => {
    // This will connect to AI service later
    console.log("Generating AI itinerary...");
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
                    <span className="font-medium">₹8,420</span>
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
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
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
                    <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Interactive map will be loaded here</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Mapbox integration coming soon
                        </p>
                      </div>
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