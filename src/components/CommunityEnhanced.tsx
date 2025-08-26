import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
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
  Star,
  Send,
  Search,
  Filter,
  Award,
  MapIcon,
  Navigation,
  Bookmark,
  UserPlus,
  MessageSquare,
  ThumbsUp,
  Eye
} from "lucide-react";

const CommunityEnhanced = () => {
  const { toast } = useToast();
  const [newPost, setNewPost] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const createPost = () => {
    if (!newPost.trim()) return;
    
    toast({
      title: "Post Created!",
      description: "Your travel experience has been shared with the community.",
    });
    setNewPost("");
  };

  const joinTrip = (tripTitle: string) => {
    toast({
      title: "Trip Joined!",
      description: `You've successfully joined "${tripTitle}". The organizer will contact you soon.`,
    });
  };

  const followUser = (username: string) => {
    toast({
      title: "Following User!",
      description: `You're now following ${username}. You'll see their updates in your feed.`,
    });
  };

  const bookmarkPost = () => {
    toast({
      title: "Post Bookmarked!",
      description: "Post saved to your bookmarks for later reference.",
    });
  };

  const posts = [
    {
      id: 1,
      author: "Priya Sharma",
      authorImage: "/placeholder.svg",
      timeAgo: "2 hours ago",
      location: "Shillong, Meghalaya",
      content: "Just witnessed the most incredible sunset at Shillong Peak! The golden hour here is absolutely magical. The entire city looked like it was painted in gold. 🌅 Perfect end to a 3-day exploration of Meghalaya's hidden gems.",
      images: ["/placeholder.svg", "/placeholder.svg"],
      likes: 156,
      comments: 23,
      shares: 8,
      views: 1240,
      tags: ["Sunset", "Shillong", "Photography", "Meghalaya"],
      verified: true
    },
    {
      id: 2,
      author: "Rohit Kumar",
      authorImage: "/placeholder.svg",
      timeAgo: "5 hours ago",
      location: "Kaziranga National Park, Assam",
      content: "Spotted a one-horned rhino with her calf today! What an incredible experience. The morning safari at Kaziranga never disappoints. The guide told us this is the 3rd calf born this season. Conservation efforts are really paying off! 🦏",
      images: ["/placeholder.svg"],
      likes: 289,
      comments: 41,
      shares: 15,
      views: 2156,
      tags: ["Wildlife", "Kaziranga", "Safari", "Conservation"],
      verified: false
    },
    {
      id: 3,
      author: "Anita Menon",
      authorImage: "/placeholder.svg",
      timeAgo: "1 day ago",
      location: "Ziro Valley, Arunachal Pradesh",
      content: "The Ziro Music Festival was absolutely incredible! Traditional Apatani music mixed with contemporary sounds created such a unique atmosphere. The valley setting made it even more magical. Already planning to return next year! 🎵",
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
      likes: 198,
      comments: 32,
      shares: 12,
      views: 1890,
      tags: ["ZiroFestival", "Music", "ArunachalPradesh", "Culture"],
      verified: true
    }
  ];

  const trips = [
    {
      id: 1,
      title: "Northeast India Cultural Expedition",
      organizer: "Adventure Seekers Northeast",
      organizerRating: 4.9,
      participants: 8,
      maxParticipants: 12,
      startDate: "March 15, 2024",
      duration: "15 days",
      difficulty: "Moderate",
      cost: "₹45,000",
      image: "/placeholder.svg",
      highlights: ["Tawang Monastery", "Kaziranga Safari", "Living Root Bridges", "Hornbill Festival"],
      description: "Comprehensive cultural tour covering all Northeast states with local guides and authentic experiences.",
      featured: true
    },
    {
      id: 2,
      title: "Meghalaya Adventure & Photography",
      organizer: "Mountain Photographers Collective",
      organizerRating: 4.7,
      participants: 6,
      maxParticipants: 10,
      startDate: "April 2, 2024",
      duration: "8 days",
      difficulty: "Easy",
      cost: "₹28,000",
      image: "/placeholder.svg",
      highlights: ["Mawlynnong Village", "Cherrapunji Falls", "Root Bridges", "Cave Exploration"],
      description: "Perfect trip for photography enthusiasts to capture Meghalaya's natural beauty.",
      featured: false
    },
    {
      id: 3,
      title: "Arunachal Pradesh Tribal Culture Tour",
      organizer: "Cultural Immersion Travels",
      organizerRating: 4.8,
      participants: 4,
      maxParticipants: 8,
      startDate: "March 25, 2024",
      duration: "12 days",
      difficulty: "Challenging",
      cost: "₹52,000",
      image: "/placeholder.svg",
      highlights: ["Tribal Villages", "Traditional Festivals", "Monastery Visits", "Himalayan Views"],
      description: "Deep dive into Arunachal's diverse tribal cultures with homestays and local guides.",
      featured: true
    }
  ];

  const topContributors = [
    { name: "Vikram Singh", points: 2850, badge: "Northeast Explorer", avatar: "/placeholder.svg", posts: 45, followers: 1230 },
    { name: "Maya Patel", points: 2340, badge: "Travel Photographer", avatar: "/placeholder.svg", posts: 38, followers: 987 },
    { name: "Arjun Reddy", points: 1890, badge: "Cultural Guide", avatar: "/placeholder.svg", posts: 32, followers: 765 },
    { name: "Kavya Iyer", points: 1650, badge: "Adventure Blogger", avatar: "/placeholder.svg", posts: 28, followers: 654 }
  ];

  const travelChallenges = [
    { title: "Northeast Explorer", description: "Visit all 8 Northeast states", progress: 60, reward: "₹5,000 voucher" },
    { title: "Wildlife Enthusiast", description: "Spot 10 different wildlife species", progress: 80, reward: "Safari gear" },
    { title: "Cultural Ambassador", description: "Visit 5 tribal festivals", progress: 40, reward: "Cultural tour discount" },
    { title: "Photo Contest Winner", description: "Get 500+ likes on a photo", progress: 75, reward: "Professional photography workshop" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Enhanced Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              TripWeave Community
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with 50,000+ travelers, share experiences, and discover Northeast India together
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="gradient-hero text-white" onClick={() => setNewPost("What's your latest travel story?")}>
                <Camera className="h-5 w-5 mr-2" />
                Share Your Adventure
              </Button>
              <Button size="lg" variant="outline">
                <Users className="h-5 w-5 mr-2" />
                Join Group Trip
              </Button>
              <Button size="lg" variant="outline">
                <MapIcon className="h-5 w-5 mr-2" />
                Find Travel Buddies
              </Button>
            </div>
            
            {/* Community Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Active Travelers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">2.5K+</div>
                <div className="text-sm text-muted-foreground">Group Trips</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">15K+</div>
                <div className="text-sm text-muted-foreground">Photos Shared</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">1M+</div>
                <div className="text-sm text-muted-foreground">Experiences</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Search & Filter Bar */}
      <section className="py-6 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts, destinations, travelers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <MapIcon className="h-4 w-4 mr-2" />
                Map View
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-6">
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="trips">Group Trips</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            {/* Enhanced Community Feed */}
            <TabsContent value="feed" className="mt-8">
              <div className="grid lg:grid-cols-4 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Enhanced Post Creation */}
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="flex gap-3 items-start">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>YU</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            placeholder="Share your latest travel experience, tips, or ask questions..."
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            className="min-h-[100px] resize-none border-0 bg-muted"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Camera className="h-4 w-4 mr-2" />
                            Photo
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MapPin className="h-4 w-4 mr-2" />
                            Location
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Users className="h-4 w-4 mr-2" />
                            Tag Friends
                          </Button>
                        </div>
                        <Button 
                          className="gradient-hero text-white"
                          onClick={createPost}
                          disabled={!newPost.trim()}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {posts.map((post) => (
                    <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={post.authorImage} />
                            <AvatarFallback>{post.author.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{post.author}</h4>
                              {post.verified && <Badge variant="secondary" className="text-xs">Verified</Badge>}
                              <Button variant="ghost" size="sm" onClick={() => followUser(post.author)}>
                                <UserPlus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {post.location} • {post.timeAgo}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={bookmarkPost}>
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <p className="mb-4 leading-relaxed">{post.content}</p>
                        
                        {post.images.length > 0 && (
                          <div className={`grid gap-2 mb-4 rounded-lg overflow-hidden ${
                            post.images.length === 1 ? 'grid-cols-1' :
                            post.images.length === 2 ? 'grid-cols-2' :
                            'grid-cols-3'
                          }`}>
                            {post.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Post image ${index + 1}`}
                                className="w-full h-48 object-cover hover:scale-105 transition-transform cursor-pointer"
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground">
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between border-t pt-3">
                          <div className="flex gap-6">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500">
                              <Heart className="h-4 w-4 mr-1" />
                              {post.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              {post.comments}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                              <Share2 className="h-4 w-4 mr-1" />
                              {post.shares}
                            </Button>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Eye className="h-4 w-4 mr-1" />
                            {post.views}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Enhanced Sidebar */}
                <div className="space-y-6">
                  {/* Travel Challenges */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Active Challenges
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {travelChallenges.slice(0, 2).map((challenge, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{challenge.title}</span>
                            <span className="text-xs text-muted-foreground">{challenge.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${challenge.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">{challenge.description}</p>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full">
                        View All Challenges
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Trending Destinations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Trending This Week
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {['Ziro Valley', 'Mawlynnong', 'Tawang', 'Dirang', 'Bomdila'].map((destination, index) => (
                        <div key={index} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg cursor-pointer transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-sm font-medium">{destination}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            +{Math.floor(Math.random() * 50) + 20}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Community Pulse</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Posts Today</span>
                        <span className="font-semibold text-primary">127</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">New Members</span>
                        <span className="font-semibold text-primary">23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Active Trips</span>
                        <span className="font-semibold text-primary">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Live Events</span>
                        <span className="font-semibold text-primary">5</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Enhanced Group Trips */}
            <TabsContent value="trips" className="mt-8">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Group Trips</h2>
                <Button className="gradient-hero text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Trip
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map((trip) => (
                  <Card key={trip.id} className={`overflow-hidden hover:shadow-xl transition-all duration-300 ${trip.featured ? 'ring-2 ring-primary/20' : ''}`}>
                    <div className="relative">
                      <img
                        src={trip.image}
                        alt={trip.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className={trip.difficulty === 'Easy' ? 'bg-green-500' : trip.difficulty === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'}>
                          {trip.difficulty}
                        </Badge>
                      </div>
                      {trip.featured && (
                        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                          Featured
                        </Badge>
                      )}
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        {trip.participants}/{trip.maxParticipants} joined
                      </div>
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="text-lg">{trip.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>by {trip.organizer}</span>
                        <div className="flex items-center ml-auto">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-xs">{trip.organizerRating}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{trip.description}</p>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Start Date</span>
                            <p className="font-medium">{trip.startDate}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration</span>
                            <p className="font-medium">{trip.duration}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-primary">{trip.cost}</span>
                          <span className="text-sm text-muted-foreground">per person</span>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-2">Highlights:</p>
                          <div className="flex flex-wrap gap-1">
                            {trip.highlights.slice(0, 3).map((highlight, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                            {trip.highlights.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{trip.highlights.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1" 
                            onClick={() => joinTrip(trip.title)}
                            disabled={trip.participants >= trip.maxParticipants}
                          >
                            {trip.participants >= trip.maxParticipants ? 'Trip Full' : 'Join Trip'}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Travel Challenges Tab */}
            <TabsContent value="challenges" className="mt-8">
              <div className="grid md:grid-cols-2 gap-6">
                {travelChallenges.map((challenge, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        <Badge variant="outline">{challenge.progress}% Complete</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{challenge.description}</p>
                      <div className="space-y-3">
                        <div className="w-full bg-muted rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${challenge.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Reward:</span>
                          <span className="font-medium text-primary">{challenge.reward}</span>
                        </div>
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Enhanced Photos Tab */}
            <TabsContent value="photos" className="mt-8">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Community Photos</h2>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button className="gradient-hero text-white">
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 20 }).map((_, index) => (
                  <div key={index} className="relative group cursor-pointer">
                    <img
                      src="/placeholder.svg"
                      alt={`Photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg" />
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-between text-white text-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>{Math.floor(Math.random() * 200) + 50}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{Math.floor(Math.random() * 50) + 5}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-white hover:text-primary">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="mt-8">
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">Hornbill Festival 2024</CardTitle>
                        <p className="text-muted-foreground">December 1-10, 2024 • Kohima, Nagaland</p>
                      </div>
                      <Badge className="bg-primary">Live Event</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Join fellow travelers for the spectacular Hornbill Festival, celebrating Naga culture with traditional dances, music, and crafts.</p>
                    <div className="flex gap-3">
                      <Button className="gradient-hero text-white">Join Event</Button>
                      <Button variant="outline">Learn More</Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* More events would be listed here */}
              </div>
            </TabsContent>

            {/* Enhanced Leaderboard */}
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
                      <div key={index} className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-100 text-gray-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            #{index + 1}
                          </div>
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={contributor.avatar} />
                            <AvatarFallback>{contributor.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold">{contributor.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <Badge variant="secondary" className="text-xs">
                                {contributor.badge}
                              </Badge>
                              <span>{contributor.posts} posts</span>
                              <span>{contributor.followers} followers</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-primary">{contributor.points.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">points</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => followUser(contributor.name)}>
                          Follow
                        </Button>
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

export default CommunityEnhanced;