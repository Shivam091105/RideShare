import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import RideCard from "./RideCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DriverViewProps {
  userId: string;
}

const DriverView = ({ userId }: DriverViewProps) => {
  const [availableRides, setAvailableRides] = useState<any[]>([]);
  const [myRides, setMyRides] = useState<any[]>([]);

  useEffect(() => {
    fetchAvailableRides();
    fetchMyRides();

    const channel = supabase
      .channel('driver-rides')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rides',
        },
        () => {
          fetchAvailableRides();
          fetchMyRides();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchAvailableRides = async () => {
    try {
      const { data, error } = await supabase
        .from("rides")
        .select("*, rider:profiles!rides_rider_id_fkey(*)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAvailableRides(data || []);
    } catch (error: any) {
      toast.error("Failed to load available rides");
    }
  };

  const fetchMyRides = async () => {
    try {
      const { data, error } = await supabase
        .from("rides")
        .select("*, rider:profiles!rides_rider_id_fkey(*)")
        .eq("driver_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMyRides(data || []);
    } catch (error: any) {
      toast.error("Failed to load your rides");
    }
  };

  return (
    <Tabs defaultValue="available" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="available">Available Rides</TabsTrigger>
        <TabsTrigger value="accepted">My Rides</TabsTrigger>
      </TabsList>

      <TabsContent value="available" className="space-y-4">
        <h2 className="text-2xl font-bold">Available Rides</h2>
        {availableRides.length === 0 ? (
          <Card className="gradient-card">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No rides available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          availableRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              userType="driver"
              onUpdate={() => {
                fetchAvailableRides();
                fetchMyRides();
              }}
            />
          ))
        )}
      </TabsContent>

      <TabsContent value="accepted" className="space-y-4">
        <h2 className="text-2xl font-bold">Your Accepted Rides</h2>
        {myRides.length === 0 ? (
          <Card className="gradient-card">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">You haven't accepted any rides yet</p>
            </CardContent>
          </Card>
        ) : (
          myRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              userType="driver"
              onUpdate={fetchMyRides}
            />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};

export default DriverView;