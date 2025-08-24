import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Calendar, Users, Compass } from "lucide-react";

const Hero = () => {
  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    startDate: "",
    travelers: "2"
  });

  const handleInputChange = (field: string, value: string) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    console.log("Search data:", searchData);
    // Handle trip planning logic
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 gradient-hero"></div>
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 border border-white/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 border border-white/20 rounded-full"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Hero Content */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Compass className="h-12 w-12 text-white mr-4" />
            <h1 className="text-5xl md:text-7xl font-bold text-white">
              Discover
              <span className="block text-4xl md:text-6xl mt-2 text-orange-200">
                Incredible India
              </span>
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Plan your perfect journey across India with AI-powered itineraries. 
            Explore Northeast treasures, heritage sites, and hidden gems.
          </p>

          {/* Search Card */}
          <Card className="max-w-4xl mx-auto p-6 md:p-8 bg-white/95 backdrop-blur-sm shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* From */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  From
                </label>
                <Input
                  placeholder="Delhi, Mumbai, Kolkata..."
                  value={searchData.from}
                  onChange={(e) => handleInputChange("from", e.target.value)}
                  className="h-12"
                />
              </div>

              {/* To */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-accent" />
                  To
                </label>
                <Input
                  placeholder="Shillong, Kaziranga, Tawang..."
                  value={searchData.to}
                  onChange={(e) => handleInputChange("to", e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-travel-info" />
                  Start Date
                </label>
                <Input
                  type="date"
                  value={searchData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Travelers */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center">
                  <Users className="h-4 w-4 mr-2 text-travel-warning" />
                  Travelers
                </label>
                <select
                  value={searchData.travelers}
                  onChange={(e) => handleInputChange("travelers", e.target.value)}
                  className="h-12 w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                  <option value="5+">5+ People</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <Button 
              onClick={handleSearch}
              className="w-full h-14 text-lg gradient-hero text-white border-0 hover:opacity-90 transition-opacity"
            >
              <Search className="h-5 w-5 mr-3" />
              Plan Your Indian Adventure
            </Button>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">28</div>
              <div className="text-white/80 text-sm">States & UTs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">1000+</div>
              <div className="text-white/80 text-sm">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-white/80 text-sm">Happy Travelers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-white/80 text-sm">AI Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;