import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  Camera, 
  Filter,
  Heart,
  Share,
  Navigation,
  Calendar,
  Users,
  Mountain,
  TreePine,
  Building,
  Utensils
} from "lucide-react";

const Destinations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All", icon: MapPin },
    { id: "nature", name: "Nature", icon: TreePine },
    { id: "heritage", name: "Heritage", icon: Building },
    { id: "adventure", name: "Adventure", icon: Mountain },
    { id: "food", name: "Food", icon: Utensils }
  ];

  const destinations = [
    {
      id: 1,
      name: "Kaziranga National Park",
      location: "Assam",
      category: "nature",
      rating: 4.8,
      reviews: 2847,
      image: "/placeholder.svg",
      entryFee: "₹300",
      bestTime: "Nov - Apr",
      duration: "2-3 days",
      description: "Home to the world's largest population of one-horned rhinoceros",
      highlights: ["One-horned rhino", "Tiger reserve", "Elephant safari", "Bird watching"],
      featured: true
    },
    {
      id: 2,
      name: "Shillong Peak",
      location: "Meghalaya",
      category: "nature",
      rating: 4.6,
      reviews: 1523,
      image: "/placeholder.svg",
      entryFee: "Free",
      bestTime: "Oct - May",
      duration: "Half day",
      description: "Highest point in Shillong offering panoramic views of the city",
      highlights: ["Panoramic views", "Sunset point", "Photography", "Cool climate"]
    },
    {
      id: 3,
      name: "Tawang Monastery",
      location: "Arunachal Pradesh",
      category: "heritage",
      rating: 4.9,
      reviews: 984,
      image: "/placeholder.svg",
      entryFee: "Free",
      bestTime: "Mar - Oct",
      duration: "1 day",
      description: "Largest monastery in India and second largest in the world",
      highlights: ["Buddhist architecture", "Ancient manuscripts", "Mountain views", "Peaceful ambiance"]
    },
    {
      id: 4,
      name: "Living Root Bridges",
      location: "Meghalaya",
      category: "adventure",
      rating: 4.7,
      reviews: 2156,
      image: "/placeholder.svg",
      entryFee: "₹50",
      bestTime: "Oct - Mar",
      duration: "1-2 days",
      description: "Unique bridges made from living tree roots by the Khasi tribes",
      highlights: ["Bio-engineering marvel", "Trekking", "Double decker bridge", "Natural pools"]
    },
    {
      id: 5,
      name: "Majuli Island",
      location: "Assam",
      category: "heritage",
      rating: 4.5,
      reviews: 876,
      image: "/placeholder.svg",
      entryFee: "Free",
      bestTime: "Nov - Mar",
      duration: "2 days",
      description: "World's largest river island and cultural hub of Assam",
      highlights: ["Neo-Vaishnavite culture", "Satras (monasteries)", "Bird watching", "Traditional crafts"]
    },
    {
      id: 6,
      name: "Hornbill Festival",
      location: "Nagaland",
      category: "heritage",
      rating: 4.8,
      reviews: 1234,
      image: "/placeholder.svg",
      entryFee: "₹200",
      bestTime: "Dec 1-10",
      duration: "3-5 days",
      description: "Festival of festivals showcasing Naga tribal culture",
      highlights: ["Traditional dances", "Local cuisine", "Handicrafts", "Rock concerts"]
    }
  ];

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dest.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || dest.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredDestinations = destinations.filter(dest => dest.featured);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore <span className="text-primary">Northeast India</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the hidden gems of India's Northeast - from mystical monasteries to breathtaking landscapes
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search destinations, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button variant="outline" className="h-12 px-6">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="h-10"
              >
                <category.icon className="h-4 w-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Destinations</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Destinations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinations.map((destination) => (
                <Card key={destination.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                    {destination.featured && (
                      <Badge className="absolute top-3 left-3 bg-primary">
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {destination.name}
                        </h3>
                        <p className="text-muted-foreground flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {destination.location}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{destination.rating}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({destination.reviews})
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {destination.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {destination.highlights.slice(0, 2).map((highlight, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                      {destination.highlights.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{destination.highlights.length - 2} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {destination.entryFee}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {destination.duration}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {destination.bestTime}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="flex-1 gradient-hero text-white border-0">
                        <Navigation className="h-4 w-4 mr-2" />
                        Plan Visit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Camera className="h-4 w-4 mr-2" />
                        View Photos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDestinations.map((destination) => (
                <Card key={destination.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-primary">
                      Featured
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {destination.name}
                        </h3>
                        <p className="text-muted-foreground flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {destination.location}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{destination.rating}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {destination.description}
                    </p>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="flex-1 gradient-hero text-white border-0">
                        Plan Visit
                      </Button>
                      <Button size="sm" variant="outline">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Stats Section */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-primary">{destinations.length}+</div>
              <div className="text-muted-foreground">Destinations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">8</div>
              <div className="text-muted-foreground">States</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">50k+</div>
              <div className="text-muted-foreground">Travelers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">4.8★</div>
              <div className="text-muted-foreground">Avg Rating</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Destinations;