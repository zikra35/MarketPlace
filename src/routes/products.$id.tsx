import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiMinus, FiPlus, FiShoppingCart, FiHeart, FiCheck, FiTruck } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { StarRating } from "@/components/StarRating";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useWishlist } from "@/context/WishlistContext";
import { productApi, reviewApi } from "@/lib/apiClient";
import { handleApiError } from "@/lib/handleApiError";
import { ProductCardSkeleton, ReviewCardSkeleton } from "@/components/SkeletonLoaders";
import { useNavigate } from "@tanstack/react-router";
import { formatPrice } from "@/lib/currency";
import { POLLING_INTERVALS } from "@/lib/constants";

export const Route = createFileRoute("/products/$id")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);

  // Load product details
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoadingProduct(true);
        const response = await productApi.getOne(id);
        if (response.success && response.data) {
          const product = response.data;
          setProduct(product);
          setSelectedColor(product.colors?.[0] || "");
          setSelectedSize(product.sizes?.[0] || "");
        }
      } catch (error) {
        handleApiError(error, navigate);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    loadProduct();

    // Poll for stock updates periodically to show real-time stock changes
    const pollInterval = setInterval(async () => {
      try {
        const response = await productApi.getOne(id);
        if (response.success && response.data) {
          const updatedProduct = response.data;
          // Only replace state when something visible changed, so the poll doesn't re-render constantly
          setProduct((prev: any) =>
            prev && prev.stockCount === updatedProduct.stockCount && prev.price === updatedProduct.price && prev.rating === updatedProduct.rating
              ? prev
              : updatedProduct
          );
        }
      } catch (error) {
        // Silently fail on polling errors
      }
    }, POLLING_INTERVALS.STOCK_UPDATE);

    return () => clearInterval(pollInterval);
  }, [id, navigate]);

  const productId = product?.id;
  const productCategory = product?.category;

  const loadReviews = async () => {
    try {
      setIsLoadingReviews(true);
      const response = await reviewApi.getByProduct(id);
      if (response.success && response.data) {
        setReviews(response.data);
      }
    } catch (error) {
      handleApiError(error, navigate);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Load reviews once per product (not on every stock poll)
  useEffect(() => {
    if (!productId) return;
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Load similar products once per product/category
  useEffect(() => {
    if (!productId || !productCategory) return;

    const loadSimilar = async () => {
      try {
        const response = await productApi.getAll({
          category: productCategory,
          limit: 5,
        });
        if (response.success && response.data) {
          setSimilarProducts(response.data.filter((p: any) => p.id !== productId).slice(0, 4));
        }
      } catch (error) {
        // Log error for debugging but don't show to user (similar products are optional)
        console.error('[Product Detail] Failed to load similar products:', {
          category: productCategory,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };

    loadSimilar();
  }, [productId, productCategory]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    try {
      setIsSubmittingReview(true);
      const response = await reviewApi.add(productId, { rating: reviewRating, comment: reviewComment.trim() });
      if (response.success) {
        toast.success("Thanks for your review!");
        setReviewComment("");
        setReviewRating(5);
        await loadReviews();
        const refreshed = await productApi.getOne(productId);
        if (refreshed.success && refreshed.data) setProduct(refreshed.data);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="aspect-square rounded-2xl bg-muted animate-pulse" />
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
            <div className="h-10 bg-muted rounded w-1/4 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Product not found</h1>
        <Link to="/" className="text-accent hover:underline mt-4 inline-block">Back to Home</Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-accent transition-colors">Home</Link>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Image */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1.5 rounded-lg">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </span>
          )}
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {typeof product.seller === 'object' ? product.seller.storeName || product.seller.name : product.seller} {product.sellerVerified && <span className="text-success">✓ Verified Seller</span>}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <StarRating rating={product.rating || 0} size={18} />
            <span className="text-sm text-muted-foreground">{Number(product.rating || 0).toFixed(1)} ({product.reviewCount?.toLocaleString() || 0} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-foreground">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                <span className="text-sm font-semibold text-success">Save {formatPrice(product.originalPrice - product.price)}</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            {product.inStock ? (
              <><FiCheck className="text-success" /><span className="text-sm text-success font-medium">In Stock ({product.stockCount} available)</span></>
            ) : (
              <span className="text-sm text-destructive font-medium">Out of Stock</span>
            )}
          </div>

          {/* Condition */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Condition:</span>
            <span className="text-sm font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded">{product.condition}</span>
          </div>

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Color: {selectedColor}</p>
              <div className="flex gap-2">
                {product.colors.map((c: string) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${selectedColor === c ? "border-accent bg-accent/10 text-accent font-semibold" : "border-border text-muted-foreground hover:border-accent"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Size: {selectedSize}</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-10 h-10 rounded-lg border text-sm transition-colors ${selectedSize === s ? "border-accent bg-accent/10 text-accent font-semibold" : "border-border text-muted-foreground hover:border-accent"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"><FiMinus size={14} /></button>
              <span className="w-10 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stockCount || 1, quantity + 1))} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"><FiPlus size={14} /></button>
            </div>
            {quantity > product.stockCount && (
              <p className="text-xs text-destructive mt-2">Only {product.stockCount} available</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { 
                if (quantity > product.stockCount) {
                  toast.error(`Only ${product.stockCount} items available in stock`);
                  return;
                }
                addToCart(product, selectedColor || "Default", selectedSize || undefined, quantity);
              }}
              disabled={!product.inStock}
              className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground py-3 rounded-xl font-bold hover:bg-orange-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShoppingCart size={18} /> {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button
              onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}
              className="p-3 rounded-xl border border-border hover:bg-muted transition-colors"
            >
              {wishlisted ? <FaHeart size={20} className="text-destructive" /> : <FiHeart size={20} />}
            </button>
          </div>

          {/* Delivery */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
            <FiTruck className="text-accent" size={18} />
            <span className="text-sm">Free delivery on orders over ₨5,000</span>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex border-b border-border">
          {(["description", "specs", "reviews"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {tab === "specs" ? "Specifications" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="py-6">
          {activeTab === "description" && <p className="text-muted-foreground leading-relaxed max-w-3xl">{product.description}</p>}
          {activeTab === "specs" && (
            <div className="max-w-lg space-y-3">
              {product.specifications && Object.entries(product.specifications).map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-muted-foreground text-sm">{k}</span>
                  <span className="text-sm font-medium text-foreground">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {user?.role === "customer" && !reviews.some((r: any) => (r.user?._id || r.user) === user._id) && (
                <form onSubmit={handleSubmitReview} className="border rounded-lg p-4 space-y-3 max-w-2xl">
                  <p className="font-semibold text-foreground">Write a review</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`text-2xl leading-none ${star <= reviewRating ? "text-accent" : "text-muted-foreground/40"}`}
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="What did you think of this product?"
                    rows={3}
                    className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-5 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-semibold hover:bg-orange-hover transition-colors disabled:opacity-50"
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit review"}
                  </button>
                </form>
              )}
              {isLoadingReviews ? (
                <>
                  <ReviewCardSkeleton />
                  <ReviewCardSkeleton />
                  <ReviewCardSkeleton />
                </>
              ) : reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((review: any) => (
                  <div key={review._id || review.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-foreground">{review.user?.name || review.userName || 'Customer'}</p>
                        <StarRating rating={review.rating} size={14} />
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
