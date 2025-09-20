import { Star, MapPin, Clock, ArrowDownRight, Map } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Place, PlaceCategory } from "@/lib/types";

interface PlacesResultsProps {
  places: Place[];
  isLoading: boolean;
  selectedCategory: PlaceCategory;
}

const categoryConfig = {
  hospital: {
    label: "Emergency Services",
    icon: "🏥",
    bgColor: "bg-emergency",
    textColor: "text-emergency-foreground",
  },
  pharmacy: {
    label: "Pharmacies",
    icon: "💊",
    bgColor: "bg-primary",
    textColor: "text-primary-foreground",
  },
  lodging: {
    label: "Hotels",
    icon: "🏨",
    bgColor: "bg-accent",
    textColor: "text-accent-foreground",
  },
  restaurant: {
    label: "Restaurants",
    icon: "🍽️",
    bgColor: "bg-warning",
    textColor: "text-warning-foreground",
  },
};

export default function PlacesResults({
  places,
  isLoading,
  selectedCategory,
}: PlacesResultsProps) {
  const config = categoryConfig[selectedCategory];

  const getDirections = (place: Place) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">
            Searching {config.label}...
          </h3>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start space-x-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground" data-testid="text-results-title">
          {config.label} Near You
        </h3>
        <span 
          className="text-sm text-muted-foreground"
          data-testid="text-results-count"
        >
          {places.length} places found
        </span>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {places.length === 0 ? (
          <Card className="p-6 text-center">
            <div className="text-muted-foreground">
              <div className="text-4xl mb-2">{config.icon}</div>
              <p className="text-lg font-medium mb-1">No {config.label.toLowerCase()} found</p>
              <p className="text-sm">Try expanding your search radius or selecting a different category.</p>
            </div>
          </Card>
        ) : (
          places.map((place, index) => (
            <Card 
              key={place.placeId} 
              className="place-card p-4 hover:shadow-md transition-all cursor-pointer"
              data-testid={`card-place-${index}`}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 ${config.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xl">{config.icon}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 
                    className="font-semibold text-foreground truncate mb-1"
                    data-testid={`text-place-name-${index}`}
                  >
                    {place.name}
                  </h4>
                  <p 
                    className="text-sm text-muted-foreground mb-2"
                    data-testid={`text-place-address-${index}`}
                  >
                    {place.address}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs">
                    {place.rating && (
                      <div className="flex items-center space-x-1 text-success">
                        <Star className="h-3 w-3 fill-current" />
                        <span data-testid={`text-place-rating-${index}`}>
                          {place.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span data-testid={`text-place-distance-${index}`}>
                        {place.distance.toFixed(1)} km
                      </span>
                    </div>
                    
                    {place.isOpen !== null && (
                      <div className={`flex items-center space-x-1 ${place.isOpen ? 'text-success' : 'text-destructive'}`}>
                        <Clock className="h-3 w-3" />
                        <span data-testid={`text-place-status-${index}`}>
                          {place.isOpen ? "Open now" : "Closed"}
                        </span>
                      </div>
                    )}
                    
                    {place.priceLevel && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                        data-testid={`badge-place-price-${index}`}
                      >
                        {"$".repeat(place.priceLevel)}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80 h-auto p-1"
                    data-testid={`button-show-map-${index}`}
                  >
                    <Map className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80 h-auto p-1"
                    onClick={() => getDirections(place)}
                    data-testid={`button-directions-${index}`}
                  >
                    <ArrowDownRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
