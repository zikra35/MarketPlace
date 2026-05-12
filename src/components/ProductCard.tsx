import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { StarRating } from "@/components/StarRating";
import { useCart, type Product } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/lib/currency";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  // Calculate discount percentage from originalPrice and price
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300"
    >
      {discountPercent > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md">
          -{discountPercent}%
        </span>
      )}

      <button
        onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
      >
        {wishlisted ? <FaHeart size={16} className="text-destructive" /> : <FiHeart size={16} className="text-muted-foreground" />}
      </button>

      <Link to="/products/$id" params={{ id: product.id }} className="block">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      </Link>

      <div className="p-4 space-y-2">
        {product.seller && (
          <p className="text-xs text-muted-foreground">
            {product.seller?.storeName || product.seller?.name || 'Unknown Seller'}
            {product.sellerVerified && " ✓"}
          </p>
        )}
        <Link to="/products/$id" params={{ id: product.id }}>
          <h3 className="font-semibold text-sm text-card-foreground line-clamp-2 hover:text-accent transition-colors">{product.name}</h3>
        </Link>
        {product.rating !== undefined && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={product.rating} size={12} />
            {product.reviewCount !== undefined && (
              <span className="text-xs text-muted-foreground">({product.reviewCount.toLocaleString()})</span>
            )}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-card-foreground">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
        <button
          onClick={() => addToCart(product, product.colors?.[0] || "Default")}
          className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground py-2 rounded-lg text-sm font-semibold hover:bg-orange-hover transition-colors"
        >
          <FiShoppingCart size={14} /> Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
