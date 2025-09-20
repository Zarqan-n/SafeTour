import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Place, PlaceStats } from "@/lib/types";

interface QuickStatsProps {
  places: Place[];
}

export default function QuickStats({ places }: QuickStatsProps) {
  const stats: PlaceStats = {
    hospitals: places.filter(p => p.category === "hospital").length,
    pharmacies: places.filter(p => p.category === "pharmacy").length,
    hotels: places.filter(p => p.category === "lodging").length,
    restaurants: places.filter(p => p.category === "restaurant").length,
  };

  const statItems = [
    {
      label: "Hospitals",
      value: stats.hospitals,
      color: "text-emergency",
      testId: "stat-hospitals",
    },
    {
      label: "Pharmacies",
      value: stats.pharmacies,
      color: "text-primary",
      testId: "stat-pharmacies",
    },
    {
      label: "Hotels",
      value: stats.hotels,
      color: "text-success",
      testId: "stat-hotels",
    },
    {
      label: "Restaurants",
      value: stats.restaurants,
      color: "text-warning",
      testId: "stat-restaurants",
    },
  ];

  return (
    <Card className="bg-muted">
      <CardHeader>
        <CardTitle className="text-lg">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((item) => (
            <div key={item.label} className="text-center">
              <div 
                className={`text-2xl font-bold ${item.color}`}
                data-testid={item.testId}
              >
                {item.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
