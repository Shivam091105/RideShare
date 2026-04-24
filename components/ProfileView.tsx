import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Award } from "lucide-react";

interface ProfileViewProps {
  profile: any;
  onUpdate: () => void;
}

const ProfileView = ({ profile }: ProfileViewProps) => {
  const getRoleBadge = (role: string) => {
    const variants = {
      rider: "bg-primary text-primary-foreground",
      driver: "bg-accent text-accent-foreground",
      both: "bg-gradient-hero text-primary-foreground",
    };
    return variants[role as keyof typeof variants] || "bg-muted";
  };

  return (
    <div className="space-y-6">
      <Card className="gradient-card shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{profile?.full_name}</CardTitle>
              <CardDescription className="mt-2">{profile?.phone || "No phone number"}</CardDescription>
            </div>
            <Badge className={getRoleBadge(profile?.role)}>
              {profile?.role === "both" ? "Rider & Driver" : profile?.role}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-warning" />
                <span>Rating</span>
              </div>
              <p className="text-2xl font-bold">{profile?.rating?.toFixed(1) || "5.0"}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Total Rides</span>
              </div>
              <p className="text-2xl font-bold">{profile?.total_rides || 0}</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">Account Details</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium">
                  {new Date(profile?.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last updated</span>
                <span className="font-medium">
                  {new Date(profile?.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>Your rideshare journey at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
              <span className="text-sm font-medium">Active Status</span>
              <Badge variant="outline" className="bg-accent text-accent-foreground">Available</Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Completed Trips</span>
              <span className="text-lg font-bold">{profile?.total_rides || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileView;