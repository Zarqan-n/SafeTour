export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  notificationPreference: 'sms' | 'email' | 'both';
};

export type SOSAlert = {
  userId: string;
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
  };
  emergencyType: 'harassment' | 'medical' | 'accident';
  status: 'active' | 'resolved';
};

export async function sendSOSAlert(
  alert: Omit<SOSAlert, 'status'>,
  contacts: EmergencyContact[]
) {
  try {
    // Send alert to server
    const response = await fetch('/api/sos/alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alert),
    });

    if (!response.ok) {
      throw new Error('Failed to send SOS alert');
    }

    // Server will handle:
    // 1. Storing the alert in the database
    // 2. Sending SMS/Email to emergency contacts
    // 3. Notifying nearby authorities
    // 4. Creating an incident report

    return await response.json();
  } catch (error) {
    console.error('Error sending SOS alert:', error);
    throw error;
  }
}