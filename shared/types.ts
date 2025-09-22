// Emergency Contact Types
export type EmergencyContact = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  notificationPreference: 'sms' | 'email' | 'both';
};

// SOS Alert Types
export type EmergencyType = 'harassment' | 'medical' | 'accident';

export type SOSAlert = {
  id?: string;
  userId: string;
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
  };
  emergencyType: EmergencyType;
  status: 'active' | 'resolved';
};