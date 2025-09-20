import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSearchSchema } from "@shared/schema";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // Disaster Alerts API
  app.get("/api/alerts", async (req, res) => {
    try {
      // For demo purposes, return sample disaster alerts
      // In production, this would fetch from ReliefWeb API or similar service
      const sampleAlerts = [
        {
          id: "1",
          title: "Flash Flood Warning",
          description: "Flash floods reported in local creeks and urban areas. Residents advised to avoid low-lying areas.",
          severity: "high",
          category: "flood",
          location: "Local Area",
          source: "Local Emergency Services",
          url: "https://emergency-services.local/alerts/fl-2023-001",
          publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          coordinates: {
            lat: 37.7749,
            lng: -122.4194
          }
        },
        {
          id: "2",
          title: "Wildfire Alert",
          description: "Brush fire spreading rapidly. Evacuation orders in place for nearby communities.",
          severity: "critical",
          category: "fire",
          location: "Regional Park Area",
          source: "Fire Department",
          url: "https://fire-dept.local/alerts/wf-2023-002",
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          coordinates: {
            lat: 37.8044,
            lng: -122.2711
          }
        },
        {
          id: "3",
          title: "Chemical Spill",
          description: "Hazardous material spill on highway. Road closures in effect.",
          severity: "high",
          category: "hazmat",
          location: "Highway Junction",
          source: "Transportation Authority",
          url: "https://transport.local/alerts/hz-2023-003",
          publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          coordinates: {
            lat: 37.7879,
            lng: -122.3892
          }
        },
        {
          id: "4",
          title: "Severe Thunderstorm",
          description: "Strong winds and heavy rain expected. Potential for power outages.",
          severity: "medium",
          category: "storm",
          location: "Metropolitan Area",
          source: "Weather Service",
          url: "https://weather.local/alerts/st-2023-004",
          publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          coordinates: {
            lat: 37.7790,
            lng: -122.4390
          }
        },
        {
          id: "5",
          title: "Gas Leak",
          description: "Natural gas leak detected. Area evacuation in progress.",
          severity: "high",
          category: "hazmat",
          location: "Downtown District",
          source: "Utility Company",
          url: "https://utility.local/alerts/gl-2023-005",
          publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          coordinates: {
            lat: 37.7694,
            lng: -122.4862
          }
        },
        {
          id: "6",
          title: "Earthquake in Turkey",
          description: "Magnitude 7.2 earthquake strikes southeastern Turkey causing significant damage",
          severity: "high",
          category: "earthquake",
          location: "Turkey",
          source: "ReliefWeb",
          url: "https://reliefweb.int/disaster/eq-2023-001",
          publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
          coordinates: {
            lat: 37.7749,
            lng: 35.4194
          }
        },
        {
          id: "7",
          title: "Tropical Cyclone in Philippines",
          description: "Category 3 typhoon making landfall with high winds and heavy rainfall",
          severity: "critical",
          category: "cyclone",
          location: "Philippines",
          source: "ReliefWeb",
          url: "https://reliefweb.int/disaster/tc-2023-002",
          publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          coordinates: {
            lat: 14.5995,
            lng: 120.9842
          }
        },
        {
          id: "8",
          title: "Volcanic Activity",
          description: "Increased volcanic activity detected. Alert level raised.",
          severity: "medium",
          category: "volcano",
          location: "Mount Region",
          source: "Geological Survey",
          url: "https://geology.local/alerts/va-2023-006",
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          coordinates: {
            lat: 37.7558,
            lng: -122.4449
          }
        }
      ];

      res.json(sampleAlerts);
    } catch (error) {
      console.error("Error fetching disaster alerts:", error);
      res.status(500).json({ error: "Failed to fetch disaster alerts" });
    }
  });

  // Places Search API
  app.post("/api/places/search", async (req, res) => {
    try {
      const { latitude, longitude, radius = 5000, category } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      // Get Google Places API key from environment
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Google Places API key not configured" });
      }

      // Map our categories to Google Places types
      const typeMapping: { [key: string]: string } = {
        hospital: "hospital",
        pharmacy: "pharmacy",
        lodging: "lodging",
        restaurant: "restaurant"
      };

      const placeType = typeMapping[category] || "hospital";

      // Search using Google Places API Nearby Search
      const placesResponse = await axios.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json", {
        params: {
          location: `${latitude},${longitude}`,
          radius: radius,
          type: placeType,
          key: apiKey
        }
      });

      if (placesResponse.data.status !== "OK" && placesResponse.data.status !== "ZERO_RESULTS") {
        throw new Error(`Google Places API error: ${placesResponse.data.status}`);
      }

      const places = placesResponse.data.results.map((place: any) => ({
        placeId: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address || "Address not available",
        category: category,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        rating: place.rating || null,
        priceLevel: place.price_level || null,
        isOpen: place.opening_hours?.open_now || null,
        distance: calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng)
      }));

      // Store search in database
      await storage.createSearch({
        latitude,
        longitude,
        radius,
        category,
        address: req.body.address
      });

      res.json(places);
    } catch (error) {
      console.error("Error searching places:", error);
      res.status(500).json({ error: "Failed to search places" });
    }
  });

  // Geocoding API
  app.post("/api/geocode", async (req, res) => {
    try {
      const { address } = req.body;

      if (!address) {
        return res.status(400).json({ error: "Address is required" });
      }

      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Google API key not configured" });
      }

      const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
        params: {
          address: address,
          key: apiKey
        }
      });

      if (response.data.status !== "OK") {
        throw new Error(`Geocoding API error: ${response.data.status}`);
      }

      const result = response.data.results[0];
      res.json({
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formattedAddress: result.formatted_address
      });
    } catch (error) {
      console.error("Error geocoding address:", error);
      res.status(500).json({ error: "Failed to geocode address" });
    }
  });

  // Recent searches
  app.get("/api/searches/recent", async (req, res) => {
    try {
      const searches = await storage.getRecentSearches(10);
      res.json(searches);
    } catch (error) {
      console.error("Error fetching recent searches:", error);
      res.status(500).json({ error: "Failed to fetch recent searches" });
    }
  });

  // Provide Google API key to frontend (restricted by domain)
  app.get("/api/config", async (req, res) => {
    try {
      const googleApiKey = process.env.GOOGLE_API_KEY;
      res.json({
        googleApiKey: googleApiKey || null
      });
    } catch (error) {
      console.error("Error fetching config:", error);
      res.status(500).json({ error: "Failed to fetch configuration" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
