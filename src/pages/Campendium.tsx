import { useState } from "react";
import Header from "@/components/Header";
import InteractiveMap from "@/components/InteractiveMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Heart
} from "lucide-react";

const Campendium = () => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-96 bg-background border-r border-border overflow-y-auto">
          {/* Search and Controls */}
          <div className="p-4 space-y-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campgrounds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
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
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-border">
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
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Campgrounds ({campgrounds.length})</h3>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            
            {campgrounds.map((campground) => (
              <Card key={campground.id} className="hover:shadow-md transition-shadow cursor-pointer">
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
                        <Button variant="ghost" size="sm" className="p-1 h-auto">
                          <Heart className="h-3 w-3" />
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
                      
                      <div className="flex gap-1 mt-1">
                        {campground.amenities.slice(0, 3).map((amenity) => {
                          const Icon = amenityIcons[amenity as keyof typeof amenityIcons];
                          return Icon ? (
                            <Icon key={amenity} className="h-3 w-3 text-muted-foreground" />
                          ) : null;
                        })}
                        {campground.amenities.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{campground.amenities.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <InteractiveMap 
            className="h-full"
            showSearch={false}
            initialCenter={[78.9629, 20.5937]}
            initialZoom={5}
            style="mapbox://styles/mapbox/outdoors-v12"
          />
          
          {/* Map Overlay Controls */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <Card className="bg-background/95 backdrop-blur p-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    Directions
                  </Button>
                  <Button size="sm">
                    Book Now
                  </Button>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">Rishikesh River Camp</p>
                  <p className="text-xs text-muted-foreground">₹2,500/night</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campendium;