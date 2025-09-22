import express from 'express';
import { sendSMS } from './utils/sms';
import { sendEmail } from './utils/email';
import { db } from './db';
import { SOSAlert, EmergencyContact } from '@shared/types';

const router = express.Router();

// Store SOS alert and notify contacts/authorities
router.post('/alerts', async (req, res) => {
  try {
    const alert: SOSAlert = {
      ...req.body,
      status: 'active',
    };

    // 1. Store alert in database
    const storedAlert = await db.sosAlerts.create(alert);

    // 2. Get user's emergency contacts
    const contacts = await db.emergencyContacts.findMany({
      where: { userId: alert.userId },
    });

    // 3. Send notifications to emergency contacts
    await Promise.all(
      contacts.map(async (contact) => {
        const message = generateAlertMessage(alert, contact);

        if (contact.notificationPreference === 'sms' || contact.notificationPreference === 'both') {
          await sendSMS(contact.phone, message);
        }

        if (contact.notificationPreference === 'email' || contact.notificationPreference === 'both') {
          await sendEmail(contact.email, 'SOS Alert', message);
        }
      })
    );

    // 4. Notify relevant authorities based on emergency type
    await notifyAuthorities(alert);

    res.json({ success: true, alertId: storedAlert.id });
  } catch (error) {
    console.error('Error processing SOS alert:', error);
    res.status(500).json({ success: false, error: 'Failed to process SOS alert' });
  }
});

// Get list of emergency contacts for a user
router.get('/contacts', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    const contacts = await db.emergencyContacts.findMany({
      where: { userId },
    });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emergency contacts' });
  }
});

// Add or update emergency contact
router.post('/contacts', async (req, res) => {
  try {
    const contact: EmergencyContact = req.body;
    const savedContact = await db.emergencyContacts.upsert({
      where: { id: contact.id },
      update: contact,
      create: contact,
    });
    res.json(savedContact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save emergency contact' });
  }
});

// Generate alert message based on emergency type and location
function generateAlertMessage(alert: SOSAlert, contact: EmergencyContact) {
  const googleMapsLink = `https://www.google.com/maps?q=${alert.location.latitude},${alert.location.longitude}`;
  
  const emergencyTypeMessages = {
    harassment: 'reported harassment',
    medical: 'needs urgent medical assistance',
    accident: 'has been in an accident',
  };

  return `
EMERGENCY SOS ALERT

${contact.name}, this is an emergency notification.

Your contact has ${emergencyTypeMessages[alert.emergencyType]} and needs immediate assistance.

Location: ${googleMapsLink}

If you received this message, please:
1. Try to contact them immediately
2. Share this location with relevant authorities
3. Proceed to their location if possible
4. Reply to confirm you received this alert

This is an automated message from SafeTravel Emergency Response System.
`;
}

// Notify relevant authorities based on emergency type
async function notifyAuthorities(alert: SOSAlert) {
  const authorities = {
    harassment: ['police', 'tourism-police'],
    medical: ['ambulance', 'hospitals'],
    accident: ['police', 'ambulance'],
  };

  const relevantAuthorities = authorities[alert.emergencyType];
  const googleMapsLink = `https://www.google.com/maps?q=${alert.location.latitude},${alert.location.longitude}`;

  // In a real implementation, this would integrate with emergency services API
  // For now, we'll simulate the notification
  console.log(`
    Emergency Alert sent to ${relevantAuthorities.join(', ')}:
    Type: ${alert.emergencyType}
    Location: ${googleMapsLink}
    Timestamp: ${new Date(alert.timestamp).toLocaleString()}
  `);
}

export { router as sosRouter };