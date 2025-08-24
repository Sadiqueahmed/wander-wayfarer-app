import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain, 
  Map, 
  Users, 
  Smartphone, 
  CreditCard, 
  Star,
  Route,
  MapPin,
  Calendar,
  Fuel,
  Navigation,
  Download
} from "lucide-react";

const Features = () => {
  const mainFeatures = [
    {
      icon: Brain,
      title: "AI Autopilot Itinerary",
      description: "Generate smart travel plans based on your budget, duration, and preferences. Our AI suggests the best routes and hidden gems.",
      color: "text-primary"
    },
    {
      icon: Map,
      title: "Interactive Trip Planner",
      description: "Plan routes with up to 100 waypoints. Drag & drop to reorder stops and get real-time updates on travel time and costs.",
      color: "text-accent"
    },
    {
      icon: Users,
      title: "Collaborative Planning",
      description: "Invite friends and family to edit the same trip. Make group decisions easier with shared itineraries and voting features.",
      color: "text-travel-info"
    },
    {
      icon: Smartphone,
      title: "Offline Access",
      description: "Download maps and trip details for offline access. Never worry about connectivity while exploring remote Northeast destinations.",
      color: "text-travel-success"
    }
  ];

  const additionalFeatures = [
    {
      icon: Route,
      title: "Smart Routing",
      description: "Avoid tolls, ferries, highways, or dirt roads based on your preferences"
    },
    {
      icon: MapPin,
      title: "1000+ POIs",
      description: "Curated places of interest across India with photos, reviews, and visiting info"
    },
    {
      icon: Calendar,
      title: "Daily Itineraries",
      description: "Organized day-by-day plans with timings and travel estimates"
    },
    {
      icon: Fuel,
      title: "Cost Calculator",
      description: "Real-time fuel cost estimation based on vehicle type and distance"
    },
    {
      icon: Navigation,
      title: "Turn-by-Turn Navigation",
      description: "Integrated Google Maps directions for seamless travel experience"
    },
    {
      icon: Download,
      title: "Export & Share",
      description: "Export trips to PDF, share via email, or send to travel apps"
    },
    {
      icon: Star,
      title: "Community Reviews",
      description: "Read and write reviews for destinations with photo uploads"
    },
    {
      icon: CreditCard,
      title: "Integrated Bookings",
      description: "Book trains (IRCTC), buses (RedBus), hotels (OYO) directly from the app"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="text-primary">TripWeave</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The most comprehensive trip planning platform for India, designed specifically for Indian travelers with local insights and practical features.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {mainFeatures.map((feature, index) => (
            <Card key={index} className="trip-card text-center border-2 hover:border-primary/20">
              <CardContent className="p-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="bg-muted/30 rounded-2xl p-8 md:p-12">
          <h3 className="text-3xl font-bold text-center mb-12">Complete Travel Solution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-background/50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="gradient-hero rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Explore India?
            </h3>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of travelers who have discovered the beauty of India with our AI-powered trip planning platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors">
                Start Planning Free
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                View Sample Itinerary
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;