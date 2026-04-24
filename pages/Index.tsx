import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Car, MapPin, Shield, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="container relative mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-background/10 backdrop-blur-sm mb-8 animate-in shadow-glow">
            <Car className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6 animate-in">
            Your Journey, Your Way
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto animate-in">
            Connect with riders and drivers in your area. Safe, reliable, and efficient ridesharing at your fingertips.
          </p>
          <div className="flex gap-4 justify-center animate-in">
            <Button size="lg" onClick={() => navigate("/auth")} className="shadow-lg hover:shadow-glow transition-all">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="bg-background/10 backdrop-blur-sm border-primary-foreground/20 text-primary-foreground hover:bg-background/20">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose RideShare?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6 rounded-2xl gradient-card shadow-md hover:shadow-lg transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Fast & Easy</h3>
              <p className="text-muted-foreground">
                Request or offer rides in seconds. Our intuitive platform makes ridesharing effortless.
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-2xl gradient-card shadow-md hover:shadow-lg transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Safe & Secure</h3>
              <p className="text-muted-foreground">
                Verified users, real-time tracking, and secure payments ensure peace of mind.
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-2xl gradient-card shadow-md hover:shadow-lg transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-warning/10">
                <MapPin className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold">Go Anywhere</h3>
              <p className="text-muted-foreground">
                Connect with local drivers and riders. Your destination is just a tap away.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of riders and drivers already using RideShare
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="shadow-glow">
            Sign Up Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
