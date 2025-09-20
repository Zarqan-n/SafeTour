import { type DisasterAlert, type Place, type Search, type InsertDisasterAlert, type InsertPlace, type InsertSearch } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Disaster Alerts
  getDisasterAlerts(): Promise<DisasterAlert[]>;
  createDisasterAlert(alert: InsertDisasterAlert): Promise<DisasterAlert>;
  
  // Places
  getPlacesByLocation(latitude: number, longitude: number, radius: number, category?: string): Promise<Place[]>;
  createPlace(place: InsertPlace): Promise<Place>;
  getPlaceByPlaceId(placeId: string): Promise<Place | undefined>;
  
  // Searches
  createSearch(search: InsertSearch): Promise<Search>;
  getRecentSearches(limit?: number): Promise<Search[]>;
}

export class MemStorage implements IStorage {
  private disasterAlerts: Map<string, DisasterAlert>;
  private places: Map<string, Place>;
  private searches: Map<string, Search>;

  constructor() {
    this.disasterAlerts = new Map();
    this.places = new Map();
    this.searches = new Map();
  }

  async getDisasterAlerts(): Promise<DisasterAlert[]> {
    return Array.from(this.disasterAlerts.values())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  async createDisasterAlert(insertAlert: InsertDisasterAlert): Promise<DisasterAlert> {
    const id = randomUUID();
    const alert: DisasterAlert = { 
      ...insertAlert, 
      id,
      createdAt: new Date(),
      url: insertAlert.url || null,
      coordinates: insertAlert.coordinates || null,
    };
    this.disasterAlerts.set(id, alert);
    return alert;
  }

  async getPlacesByLocation(latitude: number, longitude: number, radius: number, category?: string): Promise<Place[]> {
    const places = Array.from(this.places.values());
    
    return places.filter(place => {
      // Calculate distance using Haversine formula (simplified)
      const R = 6371000; // Earth's radius in meters
      const dLat = (place.latitude - latitude) * Math.PI / 180;
      const dLon = (place.longitude - longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(latitude * Math.PI / 180) * Math.cos(place.latitude * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      const withinRadius = distance <= radius;
      const matchesCategory = !category || place.category === category;
      
      return withinRadius && matchesCategory;
    }).sort((a, b) => {
      // Sort by distance
      const distA = this.calculateDistance(latitude, longitude, a.latitude, a.longitude);
      const distB = this.calculateDistance(latitude, longitude, b.latitude, b.longitude);
      return distA - distB;
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async createPlace(insertPlace: InsertPlace): Promise<Place> {
    const id = randomUUID();
    const place: Place = { 
      ...insertPlace, 
      id,
      createdAt: new Date(),
      rating: insertPlace.rating || null,
      priceLevel: insertPlace.priceLevel || null,
      phoneNumber: insertPlace.phoneNumber || null,
      website: insertPlace.website || null,
      openingHours: insertPlace.openingHours || null,
      isOpen: insertPlace.isOpen || null,
    };
    this.places.set(id, place);
    return place;
  }

  async getPlaceByPlaceId(placeId: string): Promise<Place | undefined> {
    return Array.from(this.places.values()).find(place => place.placeId === placeId);
  }

  async createSearch(insertSearch: InsertSearch): Promise<Search> {
    const id = randomUUID();
    const search: Search = { 
      ...insertSearch, 
      id,
      createdAt: new Date(),
      address: insertSearch.address || null,
      radius: insertSearch.radius || 5000,
    };
    this.searches.set(id, search);
    return search;
  }

  async getRecentSearches(limit: number = 10): Promise<Search[]> {
    return Array.from(this.searches.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
