import { MapPin, Crosshair, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { LocationData, PlaceCategory, Place } from "@/lib/types";

interface LocationSectionProps {
  currentLocation: LocationData | null;
  onLocationChange: (location: LocationData) => void;
  searchRadius: number;
  onRadiusChange: (radius: number) => void;
  onSearch: (places: Place[]) => void;
  onSearchStart: () => void;
  selectedCategory: PlaceCategory;
}

export default function LocationSection({
  currentLocation,
  onLocationChange,
  searchRadius,
  onRadiusChange,
  onSearch,
  onSearchStart,
  selectedCategory,
}: LocationSectionProps) {
  const [locationInput, setLocationInput] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();

  const geocodeMutation = useMutation({
    mutationFn: async (address: string) => {
      const response = await apiRequest("POST", "/api/geocode", { address });
      return response.json();
    },
    onSuccess: (data: LocationData) => {
      onLocationChange(data);
      setLocationInput(data.formattedAddress || "");
      toast({
        title: "Location found",
        description: "Address successfully geocoded",
      });
    },
    onError: (error) => {
      toast({
        title: "Geocoding failed",
        description: "Could not find the specified address",
        variant: "destructive",
      });
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (params: { latitude: number; longitude: number; radius: number; category: string; address?: string }) => {
      const response = await apiRequest("POST", "/api/places/search", params);
      return response.json();
    },
    onSuccess: (places: Place[]) => {
      onSearch(places);
      toast({
        title: "Search completed",
        description: `Found ${places.length} ${selectedCategory}s nearby`,
      });
    },
    onError: (error) => {
      toast({
        title: "Search failed",
        description: "Could not search for nearby places",
        variant: "destructive",
      });
    },
  });

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location detection",
        variant: "destructive",
      });
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        onLocationChange(location);
        setLocationInput("Current location detected");
        setIsDetecting(false);
        toast({
          title: "Location detected",
          description: "Your current location has been found",
        });
      },
      (error) => {
        setIsDetecting(false);
        toast({
          title: "Location detection failed",
          description: "Please enter your location manually",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const handleSearch = () => {
    if (!currentLocation) {
      if (locationInput.trim()) {
        geocodeMutation.mutate(locationInput.trim());
        return;
      }
      toast({
        title: "Location required",
        description: "Please enter a location or detect your current location",
        variant: "destructive",
      });
      return;
    }

    onSearchStart();
    searchMutation.mutate({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      radius: searchRadius,
      category: selectedCategory,
      address: locationInput,
    });
  };

  const handleLocationInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationInput.trim()) {
      geocodeMutation.mutate(locationInput.trim());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Find Emergency Services & Places</CardTitle>
        <CardDescription>
          Locate nearby hospitals, pharmacies, hotels, and restaurants in your area
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="location-input">Your Location</Label>
            <form onSubmit={handleLocationInputSubmit} className="flex space-x-3">
              <Input
                id="location-input"
                type="text"
                placeholder="Enter city, address, or postal code"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="flex-1"
                data-testid="input-location"
              />
              <Button
                type="button"
                variant="outline"
                onClick={detectLocation}
                disabled={isDetecting}
                className="flex items-center space-x-2"
                data-testid="button-detect-location"
              >
                <Crosshair className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isDetecting ? "Detecting..." : "Detect"}
                </span>
              </Button>
            </form>
            
            {currentLocation && (
              <div className="flex items-center text-sm text-success mt-2">
                <MapPin className="h-4 w-4 mr-2" />
                <span data-testid="text-location-status">
                  Location detected: {currentLocation.formattedAddress || 
                    `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`}
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="search-radius">Search Radius</Label>
            <Select 
              value={searchRadius.toString()} 
              onValueChange={(value) => onRadiusChange(parseInt(value))}
            >
              <SelectTrigger data-testid="select-radius">
                <SelectValue placeholder="Select radius" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1000">1 km</SelectItem>
                <SelectItem value="5000">5 km</SelectItem>
                <SelectItem value="10000">10 km</SelectItem>
                <SelectItem value="25000">25 km</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button
          onClick={handleSearch}
          disabled={searchMutation.isPending || geocodeMutation.isPending}
          className="w-full"
          data-testid="button-search-places"
        >
          <Search className="h-4 w-4 mr-2" />
          {searchMutation.isPending ? "Searching..." : "Search Nearby Places"}
        </Button>
      </CardContent>
    </Card>
  );
}
