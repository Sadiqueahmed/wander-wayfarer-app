import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { 
  User, 
  Mail, 
  Lock, 
  Globe,
  Chrome,
  Facebook,
  Loader2
} from "lucide-react";

// Validation schemas
const emailSchema = z.string().email("Please enter a valid email address").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(100);
const nameSchema = z.string().min(2, "Name must be at least 2 characters").max(100);

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; confirmPassword?: string }>({});
  
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
    // Check if user is already logged in and redirect
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === 'SIGNED_IN') {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateLogin = () => {
    const newErrors: typeof errors = {};
    
    try {
      emailSchema.parse(loginForm.email);
    } catch (error) {
      if (error instanceof z.ZodError) newErrors.email = error.errors[0].message;
    }

    try {
      passwordSchema.parse(loginForm.password);
    } catch (error) {
      if (error instanceof z.ZodError) newErrors.password = error.errors[0].message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLogin()) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
          });
        } else if (error.message.includes("Email not confirmed")) {
          toast({
            variant: "destructive",
            title: "Email Not Confirmed",
            description: "Please check your email and confirm your account.",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateSignup = () => {
    const newErrors: typeof errors = {};
    
    try {
      nameSchema.parse(signupForm.name);
    } catch (error) {
      if (error instanceof z.ZodError) newErrors.name = error.errors[0].message;
    }

    try {
      emailSchema.parse(signupForm.email);
    } catch (error) {
      if (error instanceof z.ZodError) newErrors.email = error.errors[0].message;
    }

    try {
      passwordSchema.parse(signupForm.password);
    } catch (error) {
      if (error instanceof z.ZodError) newErrors.password = error.errors[0].message;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignup()) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: signupForm.email.trim(),
        password: signupForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: signupForm.name.trim(),
          }
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            variant: "destructive",
            title: "Account Exists",
            description: "An account with this email already exists. Please log in instead.",
          });
          // Switch to login tab
          setTimeout(() => {
            const loginTab = document.querySelector('[value="login"]') as HTMLElement;
            loginTab?.click();
          }, 500);
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Account Created!",
        description: "Please check your email to confirm your account, then you can log in.",
      });
      
      // Clear form and switch to login tab
      setSignupForm({ name: "", email: "", password: "", confirmPassword: "" });
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
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          value={loginForm.email}
                          onChange={(e) => {
                            setLoginForm({...loginForm, email: e.target.value});
                            setErrors({...errors, email: undefined});
                          }}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => {
                            setLoginForm({...loginForm, password: e.target.value});
                            setErrors({...errors, password: undefined});
                          }}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>

                    <Button type="submit" className="w-full gradient-hero text-white border-0" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : "Sign In"}
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
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          value={signupForm.name}
                          onChange={(e) => {
                            setSignupForm({...signupForm, name: e.target.value});
                            setErrors({...errors, name: undefined});
                          }}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={signupForm.email}
                          onChange={(e) => {
                            setSignupForm({...signupForm, email: e.target.value});
                            setErrors({...errors, email: undefined});
                          }}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password (min. 6 characters)"
                          value={signupForm.password}
                          onChange={(e) => {
                            setSignupForm({...signupForm, password: e.target.value});
                            setErrors({...errors, password: undefined});
                          }}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-confirm"
                          type="password"
                          placeholder="Confirm your password"
                          value={signupForm.confirmPassword}
                          onChange={(e) => {
                            setSignupForm({...signupForm, confirmPassword: e.target.value});
                            setErrors({...errors, confirmPassword: undefined});
                          }}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                      {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                    </div>

                    <Button type="submit" className="w-full gradient-hero text-white border-0" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : "Create Account"}
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