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
          title: "Earthquake in Turkey",
          description: "Magnitude 7.2 earthquake strikes southeastern Turkey causing significant damage",
          severity: "high",
          category: "earthquake",
          location: "Turkey",
          source: "ReliefWeb",
          url: "https://reliefweb.int/disaster/eq-2023-000001-tur",
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
          id: "2", 
          title: "Tropical Cyclone in Philippines",
          description: "Category 3 typhoon making landfall in northern Philippines with high winds and heavy rainfall",
          severity: "critical",
          category: "cyclone",
          location: "Philippines", 
          source: "ReliefWeb",
          url: "https://reliefweb.int/disaster/tc-2023-000002-phl",
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        },
        {
          id: "3",
          title: "Flooding in Bangladesh",
          description: "Monsoon floods affect thousands in northern districts of Bangladesh",
          severity: "medium",
          category: "flood",
          location: "Bangladesh",
          source: "ReliefWeb", 
          url: "https://reliefweb.int/disaster/fl-2023-000003-bgd",
          publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
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
