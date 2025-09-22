import Header from "@/components/Header";
import MapCanvas from "@/components/planner/MapCanvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Calendar, Users, Camera, Mountain, TreePine } from "lucide-react";

const Northeast = () => {
  const destinations = [
    {
      id: 1,
      name: "Shillong",
      state: "Meghalaya",
      image: "/placeholder.svg",
      rating: 4.8,
      reviews: 1250,
      description: "Scotland of the East with rolling hills and cascading waterfalls",
      bestTime: "Oct-May",
      duration: "3-4 days",
      highlights: ["Living Root Bridges", "Elephant Falls", "Umiam Lake"],
      coordinates: [91.8933, 25.5788]
    },
    {
      id: 2,
      name: "Kaziranga National Park",
      state: "Assam",
      image: "/placeholder.svg",
      rating: 4.9,
      reviews: 856,
      description: "Home to the one-horned rhinoceros and rich biodiversity",
      bestTime: "Nov-Apr",
      duration: "2-3 days",
      highlights: ["One-horned Rhino", "Tiger Safari", "Elephant Safari"],
      coordinates: [93.3712, 26.5775]
    },
    {
      id: 3,
      name: "Tawang",
      state: "Arunachal Pradesh",
      image: "/placeholder.svg",
      rating: 4.7,
      reviews: 634,
      description: "Mystical monastery town with breathtaking mountain views",
      bestTime: "Mar-Oct",
      duration: "4-5 days",
      highlights: ["Tawang Monastery", "Sela Pass", "Jaswant Garh"],
      coordinates: [91.8622, 27.5856]
    },
    {
      id: 4,
      name: "Majuli Island",
      state: "Assam",
      image: "/placeholder.svg",
      rating: 4.6,
      reviews: 423,
      description: "World's largest river island with unique Vaishnavite culture",
      bestTime: "Oct-Mar",
      duration: "2-3 days",
      highlights: ["Satras", "River Life", "Cultural Heritage"],
      coordinates: [94.2037, 27.0530]
    },
    {
      id: 5,
      name: "Ziro Valley",
      state: "Arunachal Pradesh",
      image: "/placeholder.svg",
      rating: 4.8,
      reviews: 567,
      description: "UNESCO World Heritage Site with Apatani tribal culture",
      bestTime: "Mar-May, Sep-Nov",
      duration: "3-4 days",
      highlights: ["Music Festival", "Pine Groves", "Tribal Culture"],
      coordinates: [93.8548, 27.5883]
    },
    {
      id: 6,
      name: "Kohima",
      state: "Nagaland",
      image: "/placeholder.svg",
      rating: 4.5,
      reviews: 389,
      description: "Historical town with rich Naga heritage and war memorials",
      bestTime: "Oct-May",
      duration: "2-3 days",
      highlights: ["War Cemetery", "Hornbill Festival", "Naga Heritage"],
      coordinates: [94.1086, 25.6747]
    }
  ];

  const experiences = [
    {
      title: "Wildlife Safaris",
      description: "Spot one-horned rhinos, tigers, and elephants",
      icon: TreePine,
      locations: ["Kaziranga", "Manas", "Nameri"]
    },
    {
      title: "Cultural Immersion",
      description: "Experience unique tribal cultures and traditions",
      icon: Users,
      locations: ["Ziro Valley", "Majuli", "Kohima"]
    },
    {
      title: "Adventure Trekking",
      description: "Trek through pristine mountains and valleys",
      icon: Mountain,
      locations: ["Tawang", "Dzukou Valley", "Mechuka"]
    },
    {
      title: "Photography Tours",
      description: "Capture stunning landscapes and wildlife",
      icon: Camera,
      locations: ["Shillong", "Tawang", "Kaziranga"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Discover Northeast India
          </h1>
          <p className="text-xl text-foreground/80 mb-8">
            Explore the hidden gems of India's pristine northeastern states
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="gradient-hero text-white">
              Plan Your Journey
            </Button>
            <Button size="lg" variant="outline">
              Watch Video
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explore on Map</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Interactive map showing all major destinations across the seven sister states
            </p>
          </div>
          
          <div className="bg-background rounded-xl shadow-lg overflow-hidden">
            <MapCanvas
              waypoints={[]}
              routeData={{}}
              googleMapsApiKey="AIzaSyBbJbSHj4dI5igT0K5WPFISHYNJuVy48oE"
              className="h-96"
            />
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Top Destinations</h2>
            <p className="text-lg text-muted-foreground">
              Must-visit places in Northeast India
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((destination) => (
              <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 right-3 bg-white/90 text-primary">
                    {destination.state}
                  </Badge>
                </div>
                
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{destination.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{destination.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{destination.description}</p>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Best: {destination.bestTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{destination.duration}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Highlights:</p>
                      <div className="flex flex-wrap gap-1">
                        {destination.highlights.map((highlight, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1" size="sm">
                        Plan Visit
                      </Button>
                      <Button variant="outline" size="sm">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Experiences Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Unique Experiences</h2>
            <p className="text-lg text-muted-foreground">
              What makes Northeast India special
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {experiences.map((experience, index) => {
              const Icon = experience.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{experience.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{experience.description}</p>
                    <div className="space-y-1">
                      {experience.locations.map((location, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs mr-1">
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore Northeast India?</h2>
          <p className="text-xl mb-8 opacity-90">
            Let us help you plan the perfect Northeast India adventure
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Start Planning
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              Get Travel Guide
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Northeast;