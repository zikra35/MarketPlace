import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiArrowRight, FiZap, FiTrendingUp, FiPackage, FiFilter, FiX } from "react-icons/fi";
import { ProductCard } from "@/components/ProductCard";
import { FilterSidebar, defaultFilters, hasActiveFilters, type FilterState } from "@/components/FilterSidebar";
import { GridSkeleton } from "@/components/SkeletonLoaders";
import { productApi } from "@/lib/apiClient";
import { handleApiError } from "@/lib/handleApiError";
import { normalizeProducts } from "@/lib/productNormalizer";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { POLLING_INTERVALS } from "@/lib/constants";
import heroMegaSale from "@/assets/hero-mega-sale.jpg";
import heroFlashDeals from "@/assets/hero-flash-deals.jpg";
import heroNewArrivals from "@/assets/hero-new-arrivals.jpg";
import type { Product } from "@/context/CartContext";

const heroImages = [heroMegaSale, heroNewArrivals, heroFlashDeals];

const heroSlides = [
  { id: 1, title: "Mega Sale Event", subtitle: "Up to 70% off on Electronics", cta: "Shop Now", bg: "gradient-navy" },
  { id: 2, title: "New Arrivals", subtitle: "Discover the latest trends in Fashion", cta: "Explore", bg: "gradient-orange" },
  { id: 3, title: "Flash Deals", subtitle: "Limited time offers — Don't miss out!", cta: "View Deals", bg: "gradient-navy" },
];

const categories = [
  "Electronics", "Fashion", "Home & Garden", "Sports", "Books",
  "Beauty", "Toys", "Automotive", "Health", "Groceries"
];

export const Route = createFileRoute("/")({
  component: HomePage,
});

function applyFilters(items: Product[], filters: FilterState) {
  return items.filter((p) => {
    if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false;
    if (filters.selectedColors.length > 0 && !p.colors?.some((c) => filters.selectedColors.includes(c))) return false;
    if (filters.selectedCategories.length > 0 && !filters.selectedCategories.includes(p.category)) return false;
    if (filters.selectedBrands.length > 0 && !filters.selectedBrands.includes(p.brand)) return false;
    if (filters.minRating > 0 && p.rating && p.rating < filters.minRating) return false;
    return true;
  });
}

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await productApi.getAll({ limit: 100 });
        console.log('[Home] API Response:', response);
        
        // Handle both response formats
        const productsData = response.data || response || [];
        console.log('[Home] Products data:', productsData);
        console.log('[Home] First product:', productsData[0]);
        
        setProducts(normalizeProducts(Array.isArray(productsData) ? productsData : []));
      } catch (error) {
        console.error('[Home] Fetch error:', error);
        handleApiError(error, navigate);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    
    // Refetch products periodically to show new products and updated stock
    const interval = setInterval(fetchProducts, POLLING_INTERVALS.PRODUCT_REFRESH);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const active = hasActiveFilters(filters);

  const flashDeals = useMemo(() => applyFilters(products.filter(p => p.isFlashDeal), filters), [products, filters]);
  const bestSellers = useMemo(() => applyFilters(products.filter(p => p.isBestSeller), filters), [products, filters]);
  const newArrivals = useMemo(() => applyFilters(products.filter(p => p.isNewArrival), filters), [products, filters]);
  const allProducts = useMemo(() => applyFilters(products, filters), [products, filters]);

  const sidebar = (
    <div className={`bg-card rounded-xl p-5 shadow-card ${active ? 'ring-2 ring-primary/50' : ''}`}>
      <h2 className="font-bold text-foreground mb-4">
        Filters {active && <span className="text-primary text-sm">(Active)</span>}
      </h2>
      <FilterSidebar filters={filters} onChange={setFilters} />
    </div>
  );

  return (
    <div className="pb-12">
      {/* Hero Carousel */}
      <section className="relative h-[300px] md:h-[420px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center"
          >
            <img
              src={heroImages[currentSlide]}
              alt={heroSlides[currentSlide].title}
              className="absolute inset-0 w-full h-full object-cover"
              width={1920}
              height={800}
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full">
              <motion.h2
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg"
              >
                {heroSlides[currentSlide].title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mt-3 text-lg md:text-xl text-white/90 max-w-lg drop-shadow"
              >
                {heroSlides[currentSlide].subtitle}
              </motion.p>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-accent text-accent-foreground font-bold rounded-lg hover:bg-orange-hover transition-colors"
                >
                  {heroSlides[currentSlide].cta} <FiArrowRight />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
        <button onClick={() => setCurrentSlide(p => (p - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/50 backdrop-blur-sm text-foreground hover:bg-card transition-colors">
          <FiChevronLeft size={20} />
        </button>
        <button onClick={() => setCurrentSlide(p => (p + 1) % heroSlides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/50 backdrop-blur-sm text-foreground hover:bg-card transition-colors">
          <FiChevronRight size={20} />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentSlide ? "bg-accent" : "bg-navy-foreground/30"}`} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat}
              to="/shop"
              className="flex items-center justify-center p-4 bg-card rounded-xl shadow-card hover:shadow-card-hover text-sm font-medium text-card-foreground hover:text-accent transition-all hover:-translate-y-0.5"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Mobile filter button */}
      <div className="max-w-7xl mx-auto px-4 mt-8 lg:hidden">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm text-foreground"
        >
          <FiFilter size={14} /> Filters {active && <span className="ml-1 w-2 h-2 rounded-full bg-primary" />}
        </button>
      </div>

      {/* Mobile filter overlay */}
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

      {/* Main content with sidebar */}
      <div className="max-w-7xl mx-auto px-4 mt-8 flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-24">{sidebar}</div>
        </aside>

        {/* Product sections */}
        <div className="flex-1 space-y-8">
          {isLoading ? (
            <GridSkeleton count={12} />
          ) : (
            <>
              {flashDeals.length > 0 && (
                <ProductSection title="Flash Deals" icon={<FiZap className="text-accent" />} products={flashDeals} />
              )}
              {bestSellers.length > 0 && (
                <ProductSection title="Best Sellers" icon={<FiTrendingUp className="text-accent" />} products={bestSellers} />
              )}
              {newArrivals.length > 0 && (
                <ProductSection title="New Arrivals" icon={<FiPackage className="text-accent" />} products={newArrivals} />
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Recommended For You</h2>
                  <span className="text-sm text-muted-foreground">{allProducts.length} results</span>
                </div>
                {allProducts.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">No products match your filters.</p>
                    <button onClick={() => setFilters(defaultFilters)} className="mt-3 text-primary hover:underline text-sm">
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {allProducts.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductSection({ title, icon, products: items }: { title: string; icon: React.ReactNode; products: Product[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
