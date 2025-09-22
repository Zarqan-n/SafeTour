import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

type SafeLocation = {
  lat: number;
  lng: number;
  name: string;
  type: 'police' | 'hospital' | 'embassy';
};

type MapProps = {
  userLocation: { latitude: number; longitude: number } | null;
  isTracking: boolean;
  showEmergencyServices?: boolean;
};

declare global {
  interface Window {
    google: any;
  }
}

export default function SafePlacesMap({ userLocation, isTracking, showEmergencyServices }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!userLocation || !mapRef.current || !window.google) return;

    // Initialize map if not already initialized
    if (!googleMapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: { lat: userLocation.latitude, lng: userLocation.longitude },
        mapTypeControl: false,
      });
      googleMapRef.current = map;
    }

    // Update or create user location marker
    if (!userMarkerRef.current) {
      userMarkerRef.current = new window.google.maps.Marker({
        position: { lat: userLocation.latitude, lng: userLocation.longitude },
        map: googleMapRef.current,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: '#FF0000',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });
    } else {
      userMarkerRef.current.setPosition({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
    }

    // Center map on user location if tracking
    if (isTracking) {
      googleMapRef.current.panTo({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
    }

    // Search for nearby safe places and emergency services
    const service = new window.google.maps.places.PlacesService(googleMapRef.current);
    
    // Define search types based on props
    const searchTypes = showEmergencyServices 
      ? ['police', 'hospital', 'fire_station', 'pharmacy', 'ambulance_station']
      : ['police', 'hospital', 'embassy'];

    searchTypes.forEach(type => {
      const request = {
        location: { lat: userLocation.latitude, lng: userLocation.longitude },
        radius: showEmergencyServices ? 10000 : 5000, // 10km radius for emergency services, 5km for safe places
        type: type,
        rankBy: window.google.maps.places.RankBy.DISTANCE,
      };

      service.nearbySearch(request, (results: any[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          results.forEach(place => {
            // Create info window for the place
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div class="p-2">
                  <h3 class="font-bold">${place.name}</h3>
                  <p>${place.vicinity}</p>
                  ${place.rating ? `<p>Rating: ${place.rating} ⭐</p>` : ''}
                  ${place.opening_hours?.open_now ? '<p class="text-green-600">Open now</p>' : ''}
                </div>
              `
            });

            // Create marker
            const marker = new window.google.maps.Marker({
              position: place.geometry.location,
              map: googleMapRef.current,
              title: place.name,
              icon: {
                url: getMarkerIcon(type),
                scaledSize: new window.google.maps.Size(30, 30),
              },
            });

            // Add click listener to show info window
            marker.addListener('click', () => {
              infoWindow.open(googleMapRef.current, marker);
            });
          });
        }
      });
    });
  }, [userLocation, isTracking]);

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'police':
        return '/icons/police.png';
      case 'hospital':
        return '/icons/hospital.png';
      case 'embassy':
        return '/icons/embassy.png';
      case 'fire_station':
        return '/icons/fire.png';
      case 'pharmacy':
        return '/icons/pharmacy.png';
      case 'ambulance_station':
        return '/icons/ambulance.png';
      default:
        return '/icons/emergency.png';
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div ref={mapRef} className="w-full h-[400px]" />
    </Card>
  );
}