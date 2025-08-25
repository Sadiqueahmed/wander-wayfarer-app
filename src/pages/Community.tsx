import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  Users, 
  Camera,
  Trophy,
  Plus,
  TrendingUp,
  Clock,
  Star
} from "lucide-react";

const Community = () => {
  const posts = [
    {
      id: 1,
      author: "Priya Sharma",
      authorImage: "/placeholder.svg",
      timeAgo: "2 hours ago",
      location: "Shillong, Meghalaya",
      content: "Just witnessed the most incredible sunset at Shillong Peak! The golden hour here is absolutely magical. The entire city looked like it was painted in gold. 🌅",
      images: ["/placeholder.svg", "/placeholder.svg"],
      likes: 156,
      comments: 23,
      shares: 8,
      tags: ["Sunset", "Shillong", "Photography"]
    },
    {
      id: 2,
      author: "Rohit Kumar",
      authorImage: "/placeholder.svg",
      timeAgo: "5 hours ago",
      location: "Kaziranga National Park, Assam",
      content: "Spotted a one-horned rhino with her calf today! What an incredible experience. The morning safari at Kaziranga never disappoints. 🦏",
      images: ["/placeholder.svg"],
      likes: 289,
      comments: 41,
      shares: 15,
      tags: ["Wildlife", "Kaziranga", "Safari"]
    },
    {
      id: 3,
      author: "Anita Menon",
      authorImage: "/placeholder.svg",
      timeAgo: "1 day ago",
      location: "Munnar, Kerala",
      content: "Tea plantation walks in Munnar are therapeutic! The misty mornings and endless green hills create the perfect escape from city life. ☕",
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
      likes: 198,
      comments: 32,
      shares: 12,
      tags: ["Munnar", "Tea Gardens", "Kerala"]
    }
  ];

  const trips = [
    {
      id: 1,
      title: "Northeast India Cultural Tour",
      organizer: "Travel Buddies Kolkata",
      participants: 8,
      maxParticipants: 12,
      startDate: "March 15, 2024",
      duration: "12 days",
      difficulty: "Moderate",
      cost: "₹35,000",
      image: "/placeholder.svg",
      highlights: ["Tawang Monastery", "Kaziranga Safari", "Majuli Island"]
    },
    {
      id: 2,
      title: "Kerala Backwaters & Hill Stations",
      organizer: "South India Explorers",
      participants: 6,
      maxParticipants: 10,
      startDate: "April 2, 2024",
      duration: "8 days",
      difficulty: "Easy",
      cost: "₹28,000",
      image: "/placeholder.svg",
      highlights: ["Alleppey Houseboats", "Munnar Tea Gardens", "Kochi Heritage"]
    },
    {
      id: 3,
      title: "Rajasthan Desert Adventure",
      organizer: "Desert Nomads",
      participants: 4,
      maxParticipants: 8,
      startDate: "March 25, 2024",
      duration: "10 days",
      difficulty: "Moderate",
      cost: "₹42,000",
      image: "/placeholder.svg",
      highlights: ["Camel Safari", "Desert Camping", "Royal Palaces"]
    }
  ];

  const topContributors = [
    { name: "Vikram Singh", points: 2850, badge: "Explorer", avatar: "/placeholder.svg" },
    { name: "Maya Patel", points: 2340, badge: "Photographer", avatar: "/placeholder.svg" },
    { name: "Arjun Reddy", points: 1890, badge: "Guide", avatar: "/placeholder.svg" },
    { name: "Kavya Iyer", points: 1650, badge: "Blogger", avatar: "/placeholder.svg" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-12 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              TripWeave Community
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Connect with fellow travelers, share experiences, and discover new adventures together
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="gradient-hero text-white">
                <Plus className="h-4 w-4 mr-2" />
                Share Your Trip
              </Button>
              <Button size="lg" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Join Group Trip
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-4">
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="trips">Group Trips</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="leaderboard">Top Contributors</TabsTrigger>
            </TabsList>

            {/* Community Feed */}
            <TabsContent value="feed" className="mt-8">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="p-4">
                    <div className="flex gap-3 items-center">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>YU</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-muted rounded-lg p-3 text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors">
                          Share your travel experience...
                        </div>
                      </div>
                      <Button className="gradient-hero text-white">
                        <Camera className="h-4 w-4 mr-2" />
                        Post
                      </Button>
                    </div>
                  </Card>

                  {posts.map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={post.authorImage} />
                            <AvatarFallback>{post.author.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{post.author}</h4>
                              <Badge variant="outline" className="text-xs">
                                <MapPin className="h-3 w-3 mr-1" />
                                {post.location}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{post.timeAgo}</p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <p className="mb-4">{post.content}</p>
                        
                        {post.images.length > 0 && (
                          <div className={`grid gap-2 mb-4 ${
                            post.images.length === 1 ? 'grid-cols-1' :
                            post.images.length === 2 ? 'grid-cols-2' :
                            'grid-cols-3'
                          }`}>
                            {post.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Post image ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg bg-muted"
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-4">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500">
                              <Heart className="h-4 w-4 mr-1" />
                              {post.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {post.comments}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                              <Share2 className="h-4 w-4 mr-1" />
                              {post.shares}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Trending Destinations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Trending Now
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {['Shillong', 'Munnar', 'Goa', 'Rishikesh', 'Manali'].map((destination, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{destination}</span>
                          <Badge variant="secondary" className="text-xs">
                            {Math.floor(Math.random() * 100) + 20} posts
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Community Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Active Members</span>
                        <span className="font-semibold">12,543</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Posts Today</span>
                        <span className="font-semibold">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Group Trips</span>
                        <span className="font-semibold">156</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Group Trips */}
            <TabsContent value="trips" className="mt-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map((trip) => (
                  <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={trip.image}
                        alt={trip.title}
                        className="w-full h-48 object-cover"
                      />
                      <Badge className="absolute top-3 right-3 bg-white/90 text-primary">
                        {trip.difficulty}
                      </Badge>
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="text-lg">{trip.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>by {trip.organizer}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Participants</span>
                          <span className="font-medium">{trip.participants}/{trip.maxParticipants}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Start Date</span>
                          <span className="font-medium">{trip.startDate}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Duration</span>
                          <span className="font-medium">{trip.duration}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cost</span>
                          <span className="font-semibold text-primary">{trip.cost}</span>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-2">Highlights:</p>
                          <div className="flex flex-wrap gap-1">
                            {trip.highlights.map((highlight, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <Button className="w-full">
                          Join Trip
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Photos Tab */}
            <TabsContent value="photos" className="mt-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="relative group cursor-pointer">
                    <img
                      src="/placeholder.svg"
                      alt={`Photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <Heart className="h-4 w-4" />
                        <span>{Math.floor(Math.random() * 100) + 10}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Leaderboard */}
            <TabsContent value="leaderboard" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top Contributors This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topContributors.map((contributor, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-2xl font-bold text-muted-foreground w-8">
                            #{index + 1}
                          </div>
                          <Avatar>
                            <AvatarImage src={contributor.avatar} />
                            <AvatarFallback>{contributor.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{contributor.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {contributor.badge}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">{contributor.points}</div>
                          <div className="text-xs text-muted-foreground">points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Community;