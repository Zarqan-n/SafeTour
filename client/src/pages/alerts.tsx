import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, MapPin, Clock, ExternalLink } from "lucide-react";
import type { DisasterAlert } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function AlertsPage() {
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const renderAlert = (alert: DisasterAlert & { distance: number }) => {
    return (
      <Card key={alert.id} className="overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-start">
            <Badge className={getSeverityColor(alert.severity)}>
              <AlertTriangle className="h-4 w-4 mr-1" />
              {alert.severity}
            </Badge>
            <span className="text-2xl" role="img" aria-label={alert.category}>
              {getCategoryIcon(alert.category)}
            </span>
          </div>
          <CardTitle className="mt-4">{alert.title}</CardTitle>
          <CardDescription className="flex items-center mt-2">
            <Clock className="h-4 w-4 mr-1" />
            {format(new Date(alert.publishedAt), 'MMM d, yyyy h:mm a')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{alert.description}</p>
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="w-fit">
              <MapPin className="h-4 w-4 mr-1" />
              {alert.distance.toFixed(1)} km away
            </Badge>
            <Button variant="outline" size="sm" className="w-fit" asChild>
              <a href={alert.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                More Details
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const { data: alerts = [], isLoading } = useQuery<DisasterAlert[]>({
    queryKey: ["api", "alerts"],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Sort alerts by distance and always include at least 4
  const sortedAlerts = useMemo(() => {
    // If no location but have alerts, show first 4 without distance
    if (!userLocation && alerts.length) {
      return alerts.slice(0, 4).map(alert => ({
        ...alert,
        distance: 0
      }));
    }

    // If no alerts, return empty array
    if (!alerts.length) return [];

    const alertsWithDistance = alerts.map(alert => ({
      ...alert,
      distance: alert.coordinates
        ? calculateDistance(
            userLocation?.lat ?? 0,
            userLocation?.lng ?? 0,
            alert.coordinates.lat,
            alert.coordinates.lng
          )
        : Infinity
    }));

    // Sort by distance and ensure at least 4 alerts
    const sorted = alertsWithDistance.sort((a, b) => a.distance - b.distance);
    const minAlerts = Math.max(4, sorted.length);
    return sorted.slice(0, minAlerts);
  }, [alerts, userLocation]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-blue-500 text-white";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "earthquake":
        return "🌍";
      case "flood":
        return "🌊";
      case "cyclone":
        return "🌪️";
      case "wildfire":
        return "🔥";
      case "volcano":
        return "🌋";
      case "drought":
        return "🏜️";
      default:
        return "⚠️";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Disaster Alerts</h1>
              <p className="mt-2 text-muted-foreground">
                Real-time updates on disasters and emergencies
              </p>
            </div>
            
            {userLocation && (
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                <span>Location tracking active</span>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {[1, 2, 3, 4].map((n) => (
                <Card key={n} className="animate-pulse">
                  <CardHeader className="h-32 bg-muted" />
                  <CardContent className="h-24 bg-muted mt-4" />
                </Card>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Info className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Active Alerts</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  There are currently no active disaster alerts. Stay safe!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Nearest Disasters
                </h2>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {sortedAlerts.slice(0, 4).map(renderAlert)}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}