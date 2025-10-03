import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Lock, 
  Globe,
  Chrome,
  Facebook
} from "lucide-react";

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You've been logged in successfully.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match.",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: signupForm.name,
          }
        }
      });

      if (error) throw error;

      // Create profile entry
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            full_name: signupForm.name,
          });

        if (profileError) console.error('Profile creation error:', profileError);
      }

      toast({
        title: "Success!",
        description: "Account created successfully. You can now log in.",
      });
      
      // Switch to login tab
      setTimeout(() => {
        const loginTab = document.querySelector('[value="login"]') as HTMLElement;
        loginTab?.click();
      }, 500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message || "Could not create account. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error.message || "Could not authenticate with Google.",
      });
    }
  };

  const handleFacebookAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error.message || "Could not authenticate with Facebook.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Globe className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TripWeave
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to plan your perfect Indian adventure
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span>Remember me</span>
                      </label>
                      <a href="#" className="text-primary hover:underline">
                        Forgot password?
                      </a>
                    </div>

                    <Button type="submit" className="w-full gradient-hero text-white border-0" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={handleGoogleAuth}
                      className="w-full"
                    >
                      <Chrome className="h-4 w-4 mr-2" />
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleFacebookAuth}
                      className="w-full"
                    >
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="John Doe"
                          value={signupForm.name}
                          onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Create a password"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Confirm your password"
                          value={signupForm.confirmPassword}
                          onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded" required />
                      <span className="text-muted-foreground">
                        I agree to the{" "}
                        <a href="#" className="text-primary hover:underline">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-primary hover:underline">
                          Privacy Policy
                        </a>
                      </span>
                    </div>

                    <Button type="submit" className="w-full gradient-hero text-white border-0" disabled={loading}>
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={handleGoogleAuth}
                      className="w-full"
                    >
                      <Chrome className="h-4 w-4 mr-2" />
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleFacebookAuth}
                      className="w-full"
                    >
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center mt-6 text-sm text-muted-foreground">
            <p>
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthPage;