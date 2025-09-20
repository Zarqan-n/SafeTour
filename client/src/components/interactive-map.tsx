import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Expand, Layers } from "lucide-react";
import { useEffect, useRef } from "react";
import type { LocationData, Place, PlaceCategory } from "@/lib/types";

interface InteractiveMapProps {
  location: LocationData | null;
  places: Place[];
  selectedCategory: PlaceCategory;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function InteractiveMap({
  location,
  places,
  selectedCategory,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const categoryColors = {
    hospital: "#ef4444", // red
    pharmacy: "#3b82f6", // blue
    lodging: "#10b981", // green
    restaurant: "#f59e0b", // orange
  };

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMaps = async () => {
      if (window.google) {
        initializeMap();
        return;
      }

      try {
        // Fetch API key from backend
        const response = await fetch('/api/config');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const config = await response.json();
        const apiKey = config.googleApiKey;
        
        if (!apiKey) {
          console.warn("Google Maps API key not found. Map will show placeholder.");
          return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        script.onerror = () => {
          console.warn("Failed to load Google Maps script. Map will show placeholder.");
        };
        document.head.appendChild(script);
      } catch (error) {
        console.warn("Failed to load Google Maps configuration. Map will show placeholder.", error);
      }
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      const defaultCenter = location 
        ? { lat: location.latitude, lng: location.longitude }
        : { lat: -33.8688, lng: 151.2093 }; // Sydney default

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 14,
        center: defaultCenter,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      updateMapMarkers();
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && location) {
      const center = { lat: location.latitude, lng: location.longitude };
      mapInstanceRef.current.setCenter(center);
      updateMapMarkers();
    }
  }, [location, places, selectedCategory]);

  const updateMapMarkers = () => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add user location marker
    if (location) {
      const userMarker = new window.google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: mapInstanceRef.current,
        title: "Your Location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#4285f4",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      markersRef.current.push(userMarker);
    }

    // Add place markers
    places.forEach((place, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: place.latitude, lng: place.longitude },
        map: mapInstanceRef.current,
        title: place.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: categoryColors[place.category as PlaceCategory],
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 1,
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${place.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${place.address}</p>
            ${place.rating ? `<p style="margin: 0; font-size: 12px;">⭐ ${place.rating.toFixed(1)}</p>` : ''}
            <p style="margin: 0; font-size: 12px;">📍 ${place.distance.toFixed(1)} km away</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });
  };

  const toggleFullscreen = () => {
    if (!mapRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      mapRef.current.requestFullscreen();
    }
  };

  return (
    <section>
      <CardHeader className="pb-4">
        <CardTitle>Map View</CardTitle>
      </CardHeader>
      
      <div className="relative">
        <div 
          ref={mapRef}
          className="map-container rounded-lg border border-border shadow-sm overflow-hidden"
          data-testid="map-container"
        >
          {/* Fallback content when Google Maps is not available */}
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-4xl mb-4 opacity-80">🗺️</div>
              <p className="text-lg font-semibold mb-2">Interactive Map</p>
              <p className="text-sm opacity-80">Displays user location and nearby places with markers</p>
              <div className="mt-4 flex justify-center flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Hospitals</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Pharmacies</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Hotels</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Restaurants</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
          <span>Click markers for details</span>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              data-testid="button-fullscreen"
            >
              <Expand className="h-4 w-4 mr-1" />
              Fullscreen
            </Button>
            <Button
              variant="outline"
              size="sm"
              data-testid="button-layers"
            >
              <Layers className="h-4 w-4 mr-1" />
              Layers
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
