import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MapPin, Navigation, Clock, DollarSign, User, CheckCircle2, XCircle } from "lucide-react";

interface RideCardProps {
  ride: any;
  userType: "rider" | "driver";
  onUpdate: () => void;
}

const RideCard = ({ ride, userType, onUpdate }: RideCardProps) => {
  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-warning text-warning-foreground",
      accepted: "bg-primary text-primary-foreground",
      in_progress: "bg-accent text-accent-foreground",
      completed: "bg-muted text-muted-foreground",
      cancelled: "bg-destructive text-destructive-foreground",
    };
    return colors[status as keyof typeof colors] || "bg-muted";
  };

  const handleAcceptRide = async () => {
    try {
      const { error } = await supabase
        .from("rides")
        .update({ status: "accepted", driver_id: (await supabase.auth.getUser()).data.user?.id })
        .eq("id", ride.id);

      if (error) throw error;
      toast.success("Ride accepted!");
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to accept ride");
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      const updates: any = { status };
      if (status === "completed") {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("rides")
        .update(updates)
        .eq("id", ride.id);

      if (error) throw error;
      toast.success(`Ride ${status}!`);
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to update ride");
    }
  };

  return (
    <Card className="gradient-card hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              {userType === "driver" ? ride.rider?.full_name : ride.driver?.full_name || "No driver yet"}
            </span>
          </div>
          <Badge className={getStatusColor(ride.status)}>
            {ride.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Pickup</p>
            <p className="font-medium">{ride.pickup_location}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Navigation className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Destination</p>
            <p className="font-medium">{ride.dropoff_location}</p>
          </div>
        </div>

        {ride.fare && (
          <div className="flex items-center gap-3 pt-2 border-t">
            <DollarSign className="w-5 h-5 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Fare</p>
              <p className="font-bold text-lg">${ride.fare}</p>
            </div>
          </div>
        )}

        {ride.notes && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-1">Notes</p>
            <p className="text-sm">{ride.notes}</p>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
          <Clock className="w-3 h-3" />
          {new Date(ride.created_at).toLocaleDateString()} at{" "}
          {new Date(ride.created_at).toLocaleTimeString()}
        </div>
      </CardContent>

      {userType === "driver" && ride.status === "pending" && (
        <CardFooter>
          <Button onClick={handleAcceptRide} className="w-full shadow-glow">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Accept Ride
          </Button>
        </CardFooter>
      )}

      {userType === "driver" && ride.status === "accepted" && (
        <CardFooter className="gap-2">
          <Button onClick={() => handleUpdateStatus("in_progress")} className="flex-1">
            Start Trip
          </Button>
        </CardFooter>
      )}

      {userType === "driver" && ride.status === "in_progress" && (
        <CardFooter className="gap-2">
          <Button onClick={() => handleUpdateStatus("completed")} className="flex-1" variant="default">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Complete
          </Button>
        </CardFooter>
      )}

      {userType === "rider" && ride.status === "pending" && (
        <CardFooter>
          <Button
            onClick={() => handleUpdateStatus("cancelled")}
            variant="outline"
            className="w-full"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Cancel Ride
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default RideCard;