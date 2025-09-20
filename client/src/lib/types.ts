export interface DisasterAlert {
  id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  location: string;
  source: string;
  url?: string;
  publishedAt: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Place {
  placeId: string;
  name: string;
  address: string;
  category: string;
  latitude: number;
  longitude: number;
  rating?: number;
  priceLevel?: number;
  isOpen?: boolean;
  distance: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
}

export interface SearchParams {
  latitude: number;
  longitude: number;
  radius: number;
  category: string;
  address?: string;
}

export type PlaceCategory = "hospital" | "pharmacy" | "lodging" | "restaurant";

export interface PlaceStats {
  hospitals: number;
  pharmacies: number;
  hotels: number;
  restaurants: number;
}
