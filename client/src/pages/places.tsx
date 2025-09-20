import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import LocationSection from "@/components/location-section";
import CategoryFilters from "@/components/category-filters";
import PlacesResults from "@/components/places-results";
import InteractiveMap from "@/components/interactive-map";
import QuickStats from "@/components/quick-stats";
import type { LocationData, PlaceCategory, Place } from "@/lib/types";

export default function PlacesPage() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory>("hospital");
  const [searchRadius, setSearchRadius] = useState<number>(5000);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Find Nearby Places</h1>
          <p className="mt-2 text-muted-foreground">
            Search for essential services and places near you
          </p>
        </div>

        <LocationSection
          currentLocation={currentLocation}
          onLocationChange={setCurrentLocation}
          searchRadius={searchRadius}
          onRadiusChange={setSearchRadius}
          onSearch={(searchPlaces) => {
            setPlaces(searchPlaces);
            setIsSearching(false);
          }}
          onSearchStart={() => setIsSearching(true)}
          selectedCategory={selectedCategory}
        />
        
        <CategoryFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PlacesResults 
            places={places} 
            isLoading={isSearching}
            selectedCategory={selectedCategory}
          />
          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)]">
            <InteractiveMap 
              location={currentLocation}
              places={places}
              selectedCategory={selectedCategory}
            />
          </div>
        </div>
        
        <QuickStats places={places} />
      </main>
      
      <Footer />
    </div>
  );
}