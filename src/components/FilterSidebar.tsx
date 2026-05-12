import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { productApi } from "@/lib/apiClient";
import { handleApiError } from "@/lib/handleApiError";
import { useNavigate } from "@tanstack/react-router";
import type { Product } from "@/context/CartContext";

const categories = [
  "Electronics", "Fashion", "Home & Garden", "Sports", "Books",
  "Beauty", "Toys", "Automotive", "Health", "Groceries"
];

const colorSwatchMap: Record<string, string> = {
  Black: "#1a1a1a",
  White: "#f5f5f5",
  Blue: "#3b82f6",
  Silver: "#a8a8a8",
  "Rose Gold": "#b76e79",
  Navy: "#1e3a5f",
  Gray: "#6b7280",
  Red: "#ef4444",
  Green: "#22c55e",
  Pink: "#ec4899",
  "Black/White": "#1a1a1a",
  Gold: "#d4a574",
  Brown: "#8b5e3c",
  Rose: "#e8909c",
  Berry: "#8e4585",
  Nude: "#deb89f",
  Coral: "#ff6f61",
  Champagne: "#f7e7ce",
  Lavender: "#b57edc",
  Clear: "#e0e0e0",
  Cream: "#fffdd0",
  Peach: "#ffcba4",
  "Warm Tones": "#e07050",
  "Cool Tones": "#7090b0",
  "Pastel Pink": "#ffd1dc",
  Mint: "#98fb98",
  Default: "#cccccc",
};

export interface FilterState {
  priceRange: [number, number];
  selectedColors: string[];
  selectedCategories: string[];
  selectedBrands: string[];
  minRating: number;
}

export const defaultFilters: FilterState = {
  priceRange: [0, 100000],
  selectedColors: [],
  selectedCategories: [],
  selectedBrands: [],
  minRating: 0,
};

export function hasActiveFilters(filters: FilterState) {
  return (
    filters.selectedColors.length > 0 ||
    filters.selectedCategories.length > 0 ||
    filters.selectedBrands.length > 0 ||
    filters.minRating > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 100000
  );
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const [allColors, setAllColors] = useState<string[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const navigate = useNavigate();
  const { priceRange, selectedColors, selectedCategories, selectedBrands, minRating } = filters;

  // Fetch all products to extract colors and brands
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await productApi.getAll();
        const products = response.data || [];
        
        const colors = Array.from(new Set(products.flatMap((p: Product) => p.colors || [])));
        const brands = Array.from(new Set(products.map((p: Product) => p.brand).filter(Boolean)));
        
        setAllColors(colors);
        setAllBrands(brands);
      } catch (error) {
        handleApiError(error, navigate);
      }
    };

    fetchFilterOptions();
  }, [navigate]);

  const update = (partial: Partial<FilterState>) => onChange({ ...filters, ...partial });

  const toggleIn = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  return (
    <div className="space-y-6">
      {hasActiveFilters(filters) && (
        <button
          onClick={() => onChange(defaultFilters)}
          className="text-sm text-destructive hover:underline"
        >
          Clear all filters
        </button>
      )}

      {/* Category */}
      <div>
        <h3 className="font-semibold text-sm text-foreground mb-3">Category</h3>
        <div className="space-y-2">
          {categories.slice(0, 6).map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Checkbox
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() =>
                  update({ selectedCategories: toggleIn(selectedCategories, cat) })
                }
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-sm text-foreground mb-3">Price Range</h3>
        <Slider
          min={0}
          max={100000}
          step={500}
          value={[priceRange[0], priceRange[1]]}
          onValueChange={(v) => update({ priceRange: [v[0], v[1]] })}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₨{priceRange[0].toLocaleString('en-PK')}</span>
          <span>₨{priceRange[1].toLocaleString('en-PK')}</span>
        </div>
      </div>

      {/* Customer Reviews */}
      <div>
        <h3 className="font-semibold text-sm text-foreground mb-3">Customer Reviews</h3>
        <div className="space-y-1.5">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => update({ minRating: minRating === rating ? 0 : rating })}
              className={`flex items-center gap-1.5 text-sm w-full rounded-md px-2 py-1 transition-colors ${
                minRating === rating
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={i < rating ? "text-star" : "text-muted-foreground/30"}
                  >
                    ★
                  </span>
                ))}
              </span>
              <span>& Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <h3 className="font-semibold text-sm text-foreground mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {allColors.map((color) => (
            <button
              key={color}
              onClick={() => update({ selectedColors: toggleIn(selectedColors, color) })}
              title={color}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                selectedColors.includes(color)
                  ? "border-primary scale-110 ring-2 ring-primary/30"
                  : "border-border hover:border-muted-foreground"
              }`}
              style={{ backgroundColor: colorSwatchMap[color] || "#999" }}
            />
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <h3 className="font-semibold text-sm text-foreground mb-3">Brand</h3>
        <div className="space-y-2">
          {allBrands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Checkbox
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() =>
                  update({ selectedBrands: toggleIn(selectedBrands, brand) })
                }
              />
              {brand}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
