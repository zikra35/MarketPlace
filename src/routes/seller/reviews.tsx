import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiStar } from 'react-icons/fi';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { productApi, reviewApi } from '@/lib/apiClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/seller/reviews')({
  component: SellerReviewsPage,
});

function SellerReviewsPage() {
  const [filterProduct, setFilterProduct] = useState<string>('');
  const [filterRating, setFilterRating] = useState<number | ''>('');

  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: () => productApi.getMine(),
  });

  const { data: reviewsResponse, isLoading: reviewsLoading } = useQuery({
    queryKey: ['seller-reviews'],
    queryFn: async () => {
      if (!productsResponse?.data) return [];
      const allReviews = [];
      for (const product of productsResponse.data) {
        try {
          const res = await reviewApi.getByProduct(product._id);
          allReviews.push(...(res.data || []).map(r => ({ ...r, productId: product._id })));
        } catch (error) {
          // Continue
        }
      }
      return allReviews;
    },
    enabled: !!productsResponse?.data,
  });

  const products = productsResponse?.data || [];
  const reviews = reviewsResponse || [];

  const filteredReviews = reviews.filter(r => {
    const matchesProduct = !filterProduct || r.product._id === filterProduct;
    const matchesRating = !filterRating || r.rating === filterRating;
    return matchesProduct && matchesRating;
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const isLoading = productsLoading || reviewsLoading;

  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <FiArrowLeft size={18} />
              Back
            </button>
            <h1 className="text-3xl font-bold text-foreground">Reviews</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-4 py-6 bg-card border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="text-2xl font-bold text-foreground">{reviews.length}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-2xl font-bold text-foreground">{avgRating}</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={16}
                      className={i < Math.round(parseFloat(avgRating as string)) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Positive Reviews</p>
              <p className="text-2xl font-bold text-foreground">{reviews.filter(r => r.rating >= 4).length}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 py-6 bg-card border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="">All Products</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : '')}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="">All Ratings</option>
              {[5, 4, 3, 2, 1].map(r => (
                <option key={r} value={r}>{r} Stars</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reviews */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">No reviews found</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {filteredReviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-card rounded-lg border border-border p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{review.product.name}</p>
                      <p className="text-sm text-muted-foreground">by {review.customer.name}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          size={16}
                          className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-foreground mb-3">{review.comment}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
