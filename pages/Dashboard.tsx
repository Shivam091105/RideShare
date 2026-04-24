import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, LogOut, User } from "lucide-react";
import { toast } from "sonner";

import RiderView from "@/components/RiderView";
import DriverView from "@/components/DriverView";
import ProfileView from "@/components/ProfileView";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ✅ AUTH STATE HANDLING
  useEffect(() => {
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (!currentUser) {
          navigate("/auth");
        }
      });

    // Get current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!currentUser) {
        navigate("/auth");
      }
    });

    // ✅ CLEANUP
    return () => subscription.unsubscribe();
  }, [navigate]);

  // ✅ FETCH PROFILE WHEN USER AVAILABLE
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // ✅ FETCH PROFILE FUNCTION
  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error: any) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // ✅ SIGN OUT
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error: any) {
      toast.error("Failed to sign out");
    }
  };

  // ✅ LOADING UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <Car className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  // ✅ ROLE CHECKS
  const canRide = profile?.role === "rider" || profile?.role === "both";
  const canDrive = profile?.role === "driver" || profile?.role === "both";

  // ✅ MAIN UI
  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>

            <div>
              <h1 className="text-xl font-bold">RideShare</h1>
              <p className="text-xs text-muted-foreground">
                Welcome, {profile?.full_name}
              </p>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-6">
        <Tabs
          defaultValue={canRide ? "rider" : "driver"}
          className="w-full"
        >
          {/* TAB HEADERS */}
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {canRide && (
              <TabsTrigger value="rider">
                Request Ride
              </TabsTrigger>
            )}

            {canDrive && (
              <TabsTrigger value="driver">
                Available Rides
              </TabsTrigger>
            )}

            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* TAB CONTENT */}
          {canRide && (
            <TabsContent value="rider">
              <RiderView userId={user.id} />
            </TabsContent>
          )}

          {canDrive && (
            <TabsContent value="driver">
              <DriverView userId={user.id} />
            </TabsContent>
          )}

          <TabsContent value="profile">
            <ProfileView
              profile={profile}
              onUpdate={fetchProfile}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;