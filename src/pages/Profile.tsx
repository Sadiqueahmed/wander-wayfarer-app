import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, MapPin, Calendar, Camera } from "lucide-react";
import type { User as SupabaseUser } from '@supabase/supabase-js';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    full_name: "",
    avatar_url: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }

    setUser(session.user);
    await fetchProfile(session.user.id);
    await fetchTrips(session.user.id);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) {
      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        avatar_url: data.avatar_url || "",
      });
    }
  };

  const fetchTrips = async (userId: string) => {
    const { data } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      setTrips(data);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Profile updated successfully.",
      });

      await fetchProfile(user!.id);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Could not update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || user?.email} />
                <AvatarFallback className="text-2xl">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile?.full_name || 'User'}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Member since {new Date(user?.created_at || '').toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile Settings</TabsTrigger>
              <TabsTrigger value="trips">My Trips ({trips.length})</TabsTrigger>
            </TabsList>

            {/* Profile Settings Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="pl-10"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          value={user?.email || ''}
                          disabled
                          className="pl-10 bg-muted"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="avatar_url">Avatar URL</Label>
                      <div className="relative">
                        <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="avatar_url"
                          value={formData.avatar_url}
                          onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                          className="pl-10"
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full gradient-hero text-white border-0"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Trips Tab */}
            <TabsContent value="trips">
              <div className="space-y-4">
                {trips.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start planning your first adventure!
                      </p>
                      <Button className="gradient-hero text-white border-0" asChild>
                        <a href="/plan">Plan Your Trip</a>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  trips.map((trip) => (
                    <Card key={trip.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{trip.title}</CardTitle>
                            <CardDescription>{trip.description}</CardDescription>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                            trip.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {trip.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{trip.start_location} → {trip.end_location}</span>
                          </div>
                          {trip.start_date && (
                            <div className="flex items-center text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{new Date(trip.start_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/plan?trip=${trip.id}`}>View Trip</a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;