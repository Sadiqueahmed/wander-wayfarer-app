import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock } from "lucide-react";

const FeaturedDestinations = () => {
  const destinations = [
    {
      id: 1,
      name: "Shillong",
      state: "Meghalaya",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070",
      rating: 4.8,
      reviews: 2341,
      duration: "3-4 days",
      category: "Hill Station",
      highlights: ["Scotland of the East", "Living Root Bridges", "Waterfalls"],
      description: "The Scotland of the East with its rolling hills, pine forests, and vibrant culture."
    },
    {
      id: 2,
      name: "Kaziranga National Park",
      state: "Assam",
      image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=2012",
      rating: 4.9,
      reviews: 1876,
      duration: "2-3 days",
      category: "Wildlife",
      highlights: ["One-horned Rhinoceros", "UNESCO World Heritage", "Safari"],
      description: "Home to the world's largest population of one-horned rhinoceros."
    },
    {
      id: 3,
      name: "Tawang",
      state: "Arunachal Pradesh",
      image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=2070",
      rating: 4.7,
      reviews: 1234,
      duration: "4-5 days",
      category: "Mountain",
      highlights: ["Buddhist Monastery", "Himalayan Views", "War Memorial"],
      description: "Serene mountain town with the largest monastery in India."
    },
    {
      id: 4,
      name: "Majuli Island",
      state: "Assam",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=2080",
      rating: 4.6,
      reviews: 987,
      duration: "2-3 days",
      category: "Cultural",
      highlights: ["River Island", "Satras", "Traditional Arts"],
      description: "World's largest river island with rich Assamese culture and traditions."
    },
    {
      id: 5,
      name: "Darjeeling",
      state: "West Bengal",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070",
      rating: 4.8,
      reviews: 3456,
      duration: "3-4 days",
      category: "Hill Station",
      highlights: ["Tea Gardens", "Toy Train", "Kanchenjunga Views"],
      description: "Famous for its tea gardens and stunning views of the Himalayas."
    },
    {
      id: 6,
      name: "Kohima",
      state: "Nagaland",
      image: "https://images.unsplash.com/photo-1563979009-9b7d7ffbfd54?q=80&w=2070",
      rating: 4.5,
      reviews: 756,
      duration: "2-3 days",
      category: "Cultural",
      highlights: ["Hornbill Festival", "War Cemetery", "Tribal Culture"],
      description: "Experience the rich tribal culture and history of the Naga people."
    },
    {
      id: 7,
      name: "Ziro Valley",
      state: "Arunachal Pradesh",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070",
      rating: 4.6,
      reviews: 543,
      duration: "3-4 days",
      category: "Cultural",
      highlights: ["Apatani Tribe", "Music Festival", "Pine Groves"],
      description: "UNESCO World Heritage site known for its unique tribal culture and music festival."
    },
    {
      id: 8,
      name: "Mawlynnong",
      state: "Meghalaya",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070",
      rating: 4.7,
      reviews: 432,
      duration: "1-2 days",
      category: "Cultural",
      highlights: ["Cleanest Village", "Living Root Bridge", "Tree House"],
      description: "Asia's cleanest village with incredible living root bridges."
    },
    {
      id: 9,
      name: "Dirang",
      state: "Arunachal Pradesh",
      image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=2070",
      rating: 4.5,
      reviews: 298,
      duration: "2-3 days",
      category: "Mountain",
      highlights: ["Hot Springs", "Apple Orchards", "Dzong Fort"],
      description: "Charming valley town with hot springs and stunning mountain views."
    },
    {
      id: 10,
      name: "Mokokchung",
      state: "Nagaland",
      image: "https://images.unsplash.com/photo-1563979009-9b7d7ffbfd54?q=80&w=2070",
      rating: 4.4,
      reviews: 187,
      duration: "2-3 days",
      category: "Cultural",
      highlights: ["Ao Naga Culture", "Traditional Villages", "Handicrafts"],
      description: "Cultural center of the Ao Nagas with rich traditions and handicrafts."
    },
    {
      id: 11,
      name: "Cherrapunji",
      state: "Meghalaya",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070",
      rating: 4.6,
      reviews: 765,
      duration: "2-3 days",
      category: "Hill Station",
      highlights: ["Wettest Place", "Living Root Bridges", "Nohkalikai Falls"],
      description: "One of the wettest places on Earth with spectacular waterfalls."
    },
    {
      id: 12,
      name: "Bomdila",
      state: "Arunachal Pradesh",
      image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=2070",
      rating: 4.3,
      reviews: 234,
      duration: "2-3 days",
      category: "Mountain",
      highlights: ["Buddhist Monastery", "Apple Orchards", "Craft Center"],
      description: "Scenic hill station with Buddhist monasteries and craft centers."
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Hill Station":
        return "bg-accent text-accent-foreground";
      case "Wildlife":
        return "bg-travel-success text-white";
      case "Mountain":
        return "bg-secondary text-secondary-foreground";
      case "Cultural":
        return "bg-travel-warning text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Featured <span className="text-primary">Destinations</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the most breathtaking destinations across India, especially the unexplored Northeast
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <Card key={destination.id} className="trip-card group overflow-hidden">
              <div className="relative">
                <img 
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <Badge className={getCategoryColor(destination.category)}>
                    {destination.category}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{destination.rating}</span>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{destination.name}</h3>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {destination.state}
                  </div>
                </div>

                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {destination.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {destination.duration}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {destination.reviews.toLocaleString()} reviews
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {destination.highlights.slice(0, 2).map((highlight) => (
                    <Badge key={highlight} variant="outline" className="text-xs">
                      {highlight}
                    </Badge>
                  ))}
                </div>

                <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-md transition-colors font-medium">
                  Plan Trip to {destination.name}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="gradient-accent text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Explore All Northeast Destinations
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;