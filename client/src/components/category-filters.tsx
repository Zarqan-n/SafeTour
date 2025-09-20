import { Hospital, Pill, Bed, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlaceCategory } from "@/lib/types";

interface CategoryFiltersProps {
  selectedCategory: PlaceCategory;
  onCategoryChange: (category: PlaceCategory) => void;
}

const categories = [
  {
    id: "hospital" as PlaceCategory,
    label: "Hospitals",
    icon: Hospital,
    color: "emergency",
  },
  {
    id: "pharmacy" as PlaceCategory,
    label: "Pharmacies",
    icon: Pill,
    color: "primary",
  },
  {
    id: "lodging" as PlaceCategory,
    label: "Hotels",
    icon: Bed,
    color: "accent",
  },
  {
    id: "restaurant" as PlaceCategory,
    label: "Restaurants",
    icon: UtensilsCrossed,
    color: "warning",
  },
];

export default function CategoryFilters({
  selectedCategory,
  onCategoryChange,
}: CategoryFiltersProps) {
  return (
    <section>
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isSelected ? "default" : "outline"}
              className={`px-4 py-2 rounded-full font-medium border-2 transition-colors ${
                isSelected
                  ? category.color === "emergency"
                    ? "bg-emergency text-emergency-foreground border-emergency hover:bg-emergency/90"
                    : category.color === "primary"
                    ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                    : category.color === "warning"
                    ? "bg-warning text-warning-foreground border-warning hover:bg-warning/90"
                    : "bg-accent text-accent-foreground border-accent hover:bg-accent/90"
                  : "bg-card text-foreground border-border hover:bg-muted"
              }`}
              onClick={() => onCategoryChange(category.id)}
              data-testid={`button-category-${category.id}`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {category.label}
            </Button>
          );
        })}
      </div>
    </section>
  );
}
