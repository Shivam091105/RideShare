import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import RideCard from "./RideCard";
import { Plus } from "lucide-react";

interface RiderViewProps {
  userId: string;
}

const RiderView = ({ userId }: RiderViewProps) => {
  const [rides, setRides] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRides();
    
    const channel = supabase
      .channel('rider-rides')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rides',
          filter: `rider_id=eq.${userId}`,
        },
        () => fetchRides()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchRides = async () => {
    try {
      const { data, error } = await supabase
        .from("rides")
        .select("*, driver:profiles!rides_driver_id_fkey(*)")
        .eq("rider_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRides(data || []);
    } catch (error: any) {
      toast.error("Failed to load rides");
    }
  };

  const handleCreateRide = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const { error } = await supabase.from("rides").insert({
        rider_id: userId,
        pickup_location: formData.get("pickup") as string,
        dropoff_location: formData.get("dropoff") as string,
        notes: formData.get("notes") as string,
        fare: parseFloat(formData.get("fare") as string) || null,
      });

      if (error) throw error;

      toast.success("Ride requested successfully!");
      setShowForm(false);
      fetchRides();
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error("Failed to create ride");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full shadow-glow">
          <Plus className="w-4 h-4 mr-2" />
          Request New Ride
        </Button>
      )}

      {showForm && (
        <Card className="gradient-card shadow-lg">
          <CardHeader>
            <CardTitle>Request a Ride</CardTitle>
            <CardDescription>Enter your pickup and destination details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRide} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickup">Pickup Location</Label>
                <Input
                  id="pickup"
                  name="pickup"
                  placeholder="123 Main St, City"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoff">Destination</Label>
                <Input
                  id="dropoff"
                  name="dropoff"
                  placeholder="456 Oak Ave, City"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fare">Offered Fare ($)</Label>
                <Input
                  id="fare"
                  name="fare"
                  type="number"
                  step="0.01"
                  placeholder="25.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any special instructions..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Requesting..." : "Request Ride"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Rides</h2>
        {rides.length === 0 ? (
          <Card className="gradient-card">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No rides yet. Request your first ride!</p>
            </CardContent>
          </Card>
        ) : (
          rides.map((ride) => (
            <RideCard key={ride.id} ride={ride} userType="rider" onUpdate={fetchRides} />
          ))
        )}
      </div>
    </div>
  );
};

export default RiderView;