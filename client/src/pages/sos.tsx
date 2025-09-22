import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import SafePlacesMap from '@/components/safe-places-map';
import EmergencyContactsDialog from '@/components/emergency-contacts-dialog';
import type { EmergencyContact } from '@shared/types';

type Location = {
  latitude: number;
  longitude: number;
  timestamp: number;
};

type EmergencyType = 'harassment' | 'medical' | 'accident' | '';

export default function SOSPage() {
  const [location, setLocation] = useState<Location | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('');
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Error',
        description: 'Geolocation is not supported by your browser',
        variant: 'destructive',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        toast({
          title: 'Error',
          description: `Failed to get location: ${error.message}`,
          variant: 'destructive',
        });
      }
    );
  };

  // Start continuous tracking
  const startTracking = () => {
    if (!navigator.geolocation) return;

    setIsTracking(true);
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        toast({
          title: 'Error',
          description: `Location tracking failed: ${error.message}`,
          variant: 'destructive',
        });
        setIsTracking(false);
      }
    );

    // Store watchId to clear tracking later
    return () => {
      navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
    };
  };

  // Handle SOS button click
  const handleSOS = async () => {
    if (!location) {
      toast({
        title: 'Error',
        description: 'Unable to get your location',
        variant: 'destructive',
      });
      return;
    }

    if (!emergencyType) {
      toast({
        title: 'Error',
        description: 'Please select emergency type',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate sending SOS alert
      const message = `SOS! Tourist in danger. Emergency type: ${emergencyType}. Location: ${location.latitude}, ${location.longitude}`;
      console.log('Sending SOS:', message);
      
      // Start location tracking
      startTracking();
      
      toast({
        title: 'SOS Alert Sent',
        description: 'Emergency contacts and authorities have been notified',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send SOS alert',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load emergency contacts
  useEffect(() => {
    async function loadContacts() {
      try {
        const response = await fetch('/api/sos/contacts');
        if (response.ok) {
          const data = await response.json();
          setContacts(data);
        }
      } catch (error) {
        console.error('Failed to load contacts:', error);
      }
    }
    
    loadContacts();
    getCurrentLocation();
  }, []);

  const emergencyNumbers = [
    { name: 'Police', number: '15', icon: '👮‍♂️' },
    { name: 'Ambulance', number: '1122', icon: '🚑' },
    { name: 'Fire Brigade', number: '16', icon: '🚒' },
    { name: 'Emergency Services', number: '112', icon: '🆘' },
    { name: 'Women Help Line', number: '1099', icon: '👩' },
    { name: 'Child Protection', number: '1121', icon: '👶' },
    { name: 'Traffic Police', number: '130', icon: '🚔' },
    { name: 'Anti-Harassment', number: '1043', icon: '🛑' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <a 
                href="/" 
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Home
              </a>
              <a 
                href="/alerts" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Alerts
              </a>
              <a 
                href="/sos" 
                className="text-primary font-semibold"
              >
                SOS
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8">Emergency SOS</h1>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* SOS Button and Controls */}
          <Card className="p-6 space-y-4">
            <Select
              value={emergencyType}
              onValueChange={(value) => setEmergencyType(value as EmergencyType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select emergency type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="medical">Medical Emergency</SelectItem>
                <SelectItem value="accident">Accident</SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="lg"
              variant="destructive"
              className="w-full h-20 text-xl"
              onClick={handleSOS}
              disabled={loading || !location}
            >
              {loading ? 'Sending SOS...' : 'SOS EMERGENCY'}
            </Button>

            <EmergencyContactsDialog
              contacts={contacts}
              onSave={async (contact) => {
                try {
                  const response = await fetch('/api/sos/contacts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(contact),
                  });
                  
                  if (!response.ok) throw new Error('Failed to save contact');
                  
                  const savedContact = await response.json();
                  setContacts(prev => [...prev, savedContact]);
                  
                  toast({
                    title: 'Contact Saved',
                    description: 'Emergency contact has been added successfully',
                  });
                } catch (error) {
                  toast({
                    title: 'Error',
                    description: 'Failed to save emergency contact',
                    variant: 'destructive',
                  });
                }
              }}
            />

            {location && (
              <div className="text-sm text-gray-500">
                <p>Current Location:</p>
                <p>Latitude: {location.latitude}</p>
                <p>Longitude: {location.longitude}</p>
                <p>Last Updated: {new Date(location.timestamp).toLocaleTimeString()}</p>
              </div>
            )}
          </Card>

          {/* Map with nearby safe places */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Nearby Emergency Services</h2>
            <SafePlacesMap 
              userLocation={location}
              isTracking={isTracking}
              showEmergencyServices
            />
          </div>
        </div>

        {/* Emergency Numbers Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Emergency Numbers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {emergencyNumbers.map((service) => (
              <div key={service.number} className="bg-card rounded-lg shadow-sm p-4 flex items-center space-x-4">
                <div className="text-2xl">{service.icon}</div>
                <div>
                  <h3 className="font-medium text-foreground">{service.name}</h3>
                  <a 
                    href={`tel:${service.number}`}
                    className="text-primary hover:text-primary/80 font-semibold text-lg"
                  >
                    {service.number}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}