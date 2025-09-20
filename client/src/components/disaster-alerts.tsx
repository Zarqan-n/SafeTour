import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { DisasterAlert } from "@/lib/types";

export default function DisasterAlerts() {
  const [isVisible, setIsVisible] = useState(true);

  const { data: alerts, isLoading } = useQuery<DisasterAlert[]>({
    queryKey: ["/api/alerts"],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (!isVisible) return null;

  const alertText = alerts?.length 
    ? alerts.slice(0, 3).map(alert => 
        `${getAlertIcon(alert.category)} ${alert.title}: ${alert.description}`
      ).join(" • ")
    : "Loading emergency alerts...";

  return (
    <section className="bg-emergency text-emergency-foreground border-b-2 border-emergency">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            <span className="font-semibold text-sm uppercase tracking-wide">
              Live Alerts
            </span>
          </div>
          
          <div className="overflow-hidden flex-1">
            <div 
              className="alert-ticker whitespace-nowrap"
              data-testid="alert-ticker"
            >
              {isLoading ? "Loading emergency alerts..." : alertText}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 text-emergency-foreground hover:bg-red-700 p-1 h-auto"
            onClick={() => setIsVisible(false)}
            data-testid="button-close-alerts"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function getAlertIcon(category: string): string {
  const icons: { [key: string]: string } = {
    cyclone: "🌪️",
    flood: "🌊",
    fire: "🔥",
    earthquake: "🌍",
    storm: "⛈️",
    drought: "🏜️",
    volcano: "🌋",
  };
  
  return icons[category.toLowerCase()] || "⚠️";
}
