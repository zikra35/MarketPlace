import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { GridSkeleton } from "@/components/SkeletonLoaders";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
});

function WishlistPage() {
  const { items, isLoading } = useWishlist();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">My Wishlist</h1>
        <GridSkeleton count={8} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <FiHeart className="mx-auto text-muted-foreground/30" size={80} />
          <h1 className="text-2xl font-bold text-foreground mt-6">Your wishlist is empty</h1>
          <p className="text-muted-foreground mt-2">Save items you love to your wishlist.</p>
          <Link to="/" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-accent text-accent-foreground font-bold rounded-lg hover:bg-orange-hover transition-colors">
            Browse Products
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">My Wishlist ({items.length} items)</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
