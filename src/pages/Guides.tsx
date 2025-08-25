import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Clock, 
  MapPin, 
  Star, 
  BookOpen, 
  Users, 
  Camera, 
  Mountain, 
  Utensils,
  Heart,
  Share2,
  Filter
} from "lucide-react";

const Guides = () => {
  const guides = [
    {
      id: 1,
      title: "Complete Guide to Northeast India: 15-Day Itinerary",
      author: "Priya Sharma",
      authorImage: "/placeholder.svg",
      readTime: "15 min read",
      category: "Itinerary",
      tags: ["Northeast", "Adventure", "Culture"],
      image: "/placeholder.svg",
      excerpt: "Discover the hidden gems of Northeast India with this comprehensive 15-day journey through all seven sister states.",
      rating: 4.9,
      views: 12543,
      publishedDate: "2 days ago"
    },
    {
      id: 2,
      title: "Budget Travel in India: ₹1000 Per Day Challenge",
      author: "Rohit Kumar",
      authorImage: "/placeholder.svg",
      readTime: "8 min read",
      category: "Budget Travel",
      tags: ["Budget", "Backpacking", "Tips"],
      image: "/placeholder.svg",
      excerpt: "Learn how to travel across India on just ₹1000 per day with these expert tips and tricks.",
      rating: 4.7,
      views: 8976,
      publishedDate: "1 week ago"
    },
    {
      id: 3,
      title: "Food Lover's Guide to Kerala: Must-Try Dishes",
      author: "Anita Menon",
      authorImage: "/placeholder.svg",
      readTime: "12 min read",
      category: "Food & Culture",
      tags: ["Kerala", "Food", "Local Cuisine"],
      image: "/placeholder.svg",
      excerpt: "Explore Kerala's culinary treasures from traditional sadya to street food delights.",
      rating: 4.8,
      views: 15632,
      publishedDate: "3 days ago"
    },
    {
      id: 4,
      title: "Wildlife Photography in Indian National Parks",
      author: "Vikram Singh",
      authorImage: "/placeholder.svg",
      readTime: "20 min read",
      category: "Photography",
      tags: ["Wildlife", "Photography", "National Parks"],
      image: "/placeholder.svg",
      excerpt: "Master wildlife photography with tips for capturing India's incredible biodiversity.",
      rating: 4.9,
      views: 7234,
      publishedDate: "5 days ago"
    },
    {
      id: 5,
      title: "Solo Female Travel in India: Safety & Tips",
      author: "Kavya Patel",
      authorImage: "/placeholder.svg",
      readTime: "10 min read",
      category: "Solo Travel",
      tags: ["Solo Travel", "Safety", "Female Travel"],
      image: "/placeholder.svg",
      excerpt: "Essential guide for solo female travelers exploring India safely and confidently.",
      rating: 4.8,
      views: 9876,
      publishedDate: "1 week ago"
    },
    {
      id: 6,
      title: "Monsoon Travel: Best Places to Visit During Rains",
      author: "Arjun Reddy",
      authorImage: "/placeholder.svg",
      readTime: "14 min read",
      category: "Seasonal Travel",
      tags: ["Monsoon", "Weather", "Hill Stations"],
      image: "/placeholder.svg",
      excerpt: "Embrace the monsoon magic with these spectacular destinations perfect for rainy season travel.",
      rating: 4.7,
      views: 11234,
      publishedDate: "4 days ago"
    }
  ];

  const categories = [
    "All Guides",
    "Itinerary",
    "Budget Travel", 
    "Food & Culture",
    "Photography",
    "Solo Travel",
    "Seasonal Travel",
    "Adventure",
    "Heritage"
  ];

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case "Food & Culture": return Utensils;
      case "Photography": return Camera;
      case "Solo Travel": return Users;
      case "Adventure": return Mountain;
      default: return BookOpen;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Travel Guides & Stories
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Expert insights, local tips, and inspiring stories from fellow travelers
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-lg mx-auto mb-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search guides, destinations, tips..."
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
            
            {/* Quick Stats */}
            <div className="flex justify-center gap-8 text-sm text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">500+</span> Guides
              </div>
              <div>
                <span className="font-semibold text-foreground">50+</span> Authors
              </div>
              <div>
                <span className="font-semibold text-foreground">2M+</span> Readers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Categories */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button 
                key={category}
                variant={category === "All Guides" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="rounded-full">
              <Filter className="h-4 w-4 mr-1" />
              More Filters
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Guide */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge className="mb-4">Featured Guide</Badge>
            <h2 className="text-3xl font-bold">Editor's Pick</h2>
          </div>
          
          <Card className="max-w-4xl mx-auto overflow-hidden hover:shadow-lg transition-shadow">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={guides[0].image}
                  alt={guides[0].title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">{guides[0].category}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{guides[0].rating}</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-3">{guides[0].title}</h3>
                <p className="text-muted-foreground mb-4">{guides[0].excerpt}</p>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={guides[0].authorImage}
                      alt={guides[0].author}
                      className="w-8 h-8 rounded-full bg-muted"
                    />
                    <span className="text-sm font-medium">{guides[0].author}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {guides[0].readTime}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {guides[0].tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Button className="w-full md:w-auto">
                  Read Full Guide
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* All Guides Grid */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Latest Guides</h2>
            <Button variant="outline">
              View All
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.slice(1).map((guide) => {
              const CategoryIcon = getCategoryIcon(guide.category);
              return (
                <Card key={guide.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative">
                    <img
                      src={guide.image}
                      alt={guide.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/90 text-primary">
                        <CategoryIcon className="h-3 w-3 mr-1" />
                        {guide.category}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{guide.rating}</span>
                        <span className="text-xs text-muted-foreground">({guide.views} views)</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{guide.publishedDate}</span>
                    </div>
                    <CardTitle className="text-lg leading-tight">{guide.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {guide.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src={guide.authorImage}
                        alt={guide.author}
                        className="w-6 h-6 rounded-full bg-muted"
                      />
                      <span className="text-sm font-medium">{guide.author}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                        <Clock className="h-3 w-3" />
                        {guide.readTime}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {guide.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {guide.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{guide.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    
                    <Button className="w-full" variant="outline">
                      Read Guide
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 opacity-90">
            Get the latest travel guides and tips delivered to your inbox
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white text-foreground"
            />
            <Button variant="secondary">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Guides;