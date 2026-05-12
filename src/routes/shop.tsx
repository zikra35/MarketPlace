import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { ProductCard } from "@/components/ProductCard";
import { productApi } from "@/lib/apiClient";
import { handleApiError } from "@/lib/handleApiError";
import { normalizeProducts } from "@/lib/productNormalizer";
import { FilterSidebar, defaultFilters, hasActiveFilters, type FilterState } from "@/components/FilterSidebar";
import { GridSkeleton } from "@/components/SkeletonLoaders";
import { FiFilter, FiX } from "react-icons/fi";
import { useNavigate } from "@tanstack/react-router";

const shopSearchSchema = z.object({
  q: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/shop")({
  validateSearch: zodValidator(shopSearchSchema),
  component: ShopPage,
});

function ShopPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const response = await productApi.getAll({
          q: q || undefined,
          category: filters.selectedCategories.length > 0 ? filters.selectedCategories : undefined,
          minPrice: filters.priceRange[0],
          maxPrice: filters.priceRange[1],
          minRating: filters.minRating > 0 ? filters.minRating : undefined,
        });
        
        if (response.success && response.data) {
          setProducts(normalizeProducts(response.data));
        }
      } catch (error) {
        handleApiError(error, navigate);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [q, filters, navigate]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filters.selectedColors.length > 0 && !p.colors?.some((c: string) => filters.selectedColors.includes(c))) return false;
      if (filters.selectedBrands.length > 0 && !filters.selectedBrands.includes(p.brand)) return false;
      return true;
    });
  }, [products, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {q ? `Results for "${q}"` : "All Products"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{filtered.length} results</span>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-foreground"
          >
            <FiFilter size={14} /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-24 bg-card rounded-xl p-5 shadow-card">
            <h2 className="font-bold text-foreground mb-4">Filters</h2>
            <FilterSidebar filters={filters} onChange={setFilters} />
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card p-5 overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-foreground">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)}>
                  <FiX size={20} className="text-muted-foreground" />
                </button>
              </div>
              <FilterSidebar filters={filters} onChange={setFilters} />
            </div>
          </div>
        )}

        {/* Product grid */}
        <div className="flex-1">
          {isLoading ? (
            <GridSkeleton count={12} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No products match your filters.</p>
              <button onClick={() => setFilters(defaultFilters)} className="mt-3 text-primary hover:underline text-sm">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
