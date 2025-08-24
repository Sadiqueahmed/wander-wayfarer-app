import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Wand2,
  Clock,
  Camera,
  Mountain,
  Utensils,
  Building,
  TreePine,
  Compass,
  ArrowRight,
  Zap
} from "lucide-react";

const AIPlanner = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    destination: "",
    duration: "",
    budget: "",
    travelers: "",
    interests: [],
    travelStyle: "",
    preferences: ""
  });

  const travelStyles = [
    { id: "luxury", name: "Luxury", icon: Building, desc: "5-star hotels, fine dining, premium experiences" },
    { id: "adventure", name: "Adventure", icon: Mountain, desc: "Trekking, camping, outdoor activities" },
    { id: "cultural", name: "Cultural", icon: Camera, desc: "Heritage sites, local experiences, museums" },
    { id: "nature", name: "Nature", icon: TreePine, desc: "National parks, wildlife, scenic landscapes" },
    { id: "budget", name: "Budget", icon: DollarSign, desc: "Hostels, local transport, street food" },
    { id: "family", name: "Family", icon: Users, desc: "Kid-friendly activities, comfortable stays" }
  ];

  const interests = [
    "Wildlife & Nature",
    "Adventure Sports",
    "Cultural Heritage",
    "Food & Cuisine",
    "Photography",
    "Spiritual Tourism",
    "Festivals & Events",
    "Shopping",
    "Nightlife",
    "Wellness & Spa"
  ];

  const handleGenerateItinerary = async () => {
    setLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      setLoading(false);
      setStep(4);
    }, 3000);
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center">
              <Sparkles className="h-8 w-8 mr-3 text-primary" />
              AI Trip Planner
            </h1>
            <p className="text-muted-foreground text-lg">
              Let AI create your perfect Indian adventure in minutes
            </p>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {num}
                </div>
                {num < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > num ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Basic Info</span>
            <span>Preferences</span>
            <span>Generating</span>
            <span>Your Itinerary</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Where would you like to go?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Destination Region</label>
                    <select
                      value={formData.destination}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="">Select a region</option>
                      <option value="northeast">Northeast India</option>
                      <option value="himalayas">Himalayas</option>
                      <option value="rajasthan">Rajasthan</option>
                      <option value="kerala">Kerala</option>
                      <option value="goa">Goa</option>
                      <option value="kashmir">Kashmir</option>
                      <option value="uttarakhand">Uttarakhand</option>
                      <option value="himachal">Himachal Pradesh</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Trip Duration</label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="">Select duration</option>
                      <option value="3-4">3-4 days</option>
                      <option value="5-7">5-7 days</option>
                      <option value="8-10">8-10 days</option>
                      <option value="11-14">11-14 days</option>
                      <option value="15+">15+ days</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Budget (₹)</label>
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="">Select budget range</option>
                      <option value="budget">₹10,000 - ₹25,000</option>
                      <option value="mid">₹25,000 - ₹50,000</option>
                      <option value="premium">₹50,000 - ₹100,000</option>
                      <option value="luxury">₹100,000+</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Number of Travelers</label>
                    <select
                      value={formData.travelers}
                      onChange={(e) => setFormData({...formData, travelers: e.target.value})}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="">Select travelers</option>
                      <option value="1">Solo (1 person)</option>
                      <option value="2">Couple (2 people)</option>
                      <option value="3-4">Small group (3-4 people)</option>
                      <option value="5+">Large group (5+ people)</option>
                    </select>
                  </div>
                </div>

                <Button 
                  onClick={() => setStep(2)}
                  className="w-full gradient-hero text-white border-0"
                  disabled={!formData.destination || !formData.duration || !formData.budget || !formData.travelers}
                >
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Preferences */}
          {step === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>What's your travel style?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {travelStyles.map((style) => (
                      <div
                        key={style.id}
                        onClick={() => setFormData({...formData, travelStyle: style.id})}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.travelStyle === style.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <style.icon className="h-8 w-8 mb-3 text-primary" />
                        <h3 className="font-semibold mb-1">{style.name}</h3>
                        <p className="text-sm text-muted-foreground">{style.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What interests you most?</CardTitle>
                  <p className="text-muted-foreground">Select all that apply</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant={formData.interests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer p-2"
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Any specific preferences?</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.preferences}
                    onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                    placeholder="Tell us about any specific places you want to visit, dietary restrictions, accessibility needs, or other preferences..."
                    className="min-h-24"
                  />
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  className="flex-1 gradient-hero text-white border-0"
                  disabled={!formData.travelStyle || formData.interests.length === 0}
                >
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Generating */}
          {step === 3 && (
            <Card>
              <CardContent className="p-8 text-center">
                {!loading ? (
                  <div className="space-y-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Wand2 className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Ready to create your itinerary?</h2>
                      <p className="text-muted-foreground mb-6">
                        Our AI will analyze thousands of destinations and create a personalized trip plan just for you.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-sm">
                        <div className="flex items-center justify-center space-x-2">
                          <Zap className="h-4 w-4 text-primary" />
                          <span>Smart routing</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>Optimized timing</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span>Budget optimization</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={handleGenerateItinerary}
                      className="gradient-hero text-white border-0 px-8 py-3"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate My Itinerary
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Creating your perfect trip...</h2>
                      <p className="text-muted-foreground mb-6">
                        Please wait while our AI crafts your personalized itinerary
                      </p>
                      <div className="space-y-4">
                        <Progress value={33} className="w-full" />
                        <div className="text-sm text-muted-foreground">
                          Analyzing destinations and routes...
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Generated Itinerary */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Your Perfect Northeast India Adventure!</h2>
                <p className="text-muted-foreground">7-day cultural and nature experience</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {[
                    { day: 1, title: "Arrival in Guwahati", activities: ["Kamakhya Temple", "Brahmaputra River Cruise", "Local Assamese dinner"] },
                    { day: 2, title: "Kaziranga National Park", activities: ["Morning safari", "Elephant ride", "Bird watching"] },
                    { day: 3, title: "Shillong - Scotland of East", activities: ["Shillong Peak", "Ward's Lake", "Local markets"] },
                    { day: 4, title: "Cherrapunji Exploration", activities: ["Living Root Bridges", "Mawsmai Caves", "Nohkalikai Falls"] },
                    { day: 5, title: "Dawki & Mawlynnong", activities: ["Crystal clear river", "Cleanest village", "Tree house experience"] },
                    { day: 6, title: "Tawang Monastery", activities: ["Buddhist monastery", "War memorial", "Local cuisine"] },
                    { day: 7, title: "Departure", activities: ["Shopping", "Airport transfer"] }
                  ].map((day) => (
                    <Card key={day.day}>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Badge className="mr-3">Day {day.day}</Badge>
                          {day.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {day.activities.map((activity, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{activity}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Trip Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">7 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Cost</span>
                        <span className="font-medium">₹45,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Distance</span>
                        <span className="font-medium">1,200 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Destinations</span>
                        <span className="font-medium">6 cities</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-3">
                    <Button className="w-full gradient-hero text-white border-0">
                      Customize Itinerary
                    </Button>
                    <Button variant="outline" className="w-full">
                      Save Trip
                    </Button>
                    <Button variant="outline" className="w-full">
                      Share with Friends
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIPlanner;