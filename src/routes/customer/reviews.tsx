import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiStar } from "react-icons/fi";
import { reviewApi } from "@/lib/apiClient";
import { handleApiError } from "@/lib/handleApiError";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/customer/reviews")({
  component: ReviewsPage,
});

function ReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoading(true);
        const response = await reviewApi.getMyReviews?.() || { success: false, data: [] };
        if (response.success && response.data) {
          setReviews(response.data);
        } else {
          setReviews([]);
        }
      } catch (error) {
        handleApiError(error, navigate);
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadReviews();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/customer" className="inline-flex items-center gap-2 px-6 py-3 mb-8 bg-accent text-accent-foreground rounded-lg hover:bg-orange-hover transition-colors font-semibold shadow-md">
          <FiArrowLeft size={20} /> Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-8">My Reviews</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl shadow-card p-12 text-center"
          >
            <FiStar className="mx-auto text-muted-foreground/30 mb-4" size={48} />
            <p className="text-muted-foreground mb-4">You haven't written any reviews yet</p>
            <Link to="/shop" className="inline-block px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-orange-hover transition-colors">
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl shadow-card p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-card-foreground">{review.product?.name || 'Product'}</p>
                    <p className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <FiStar
                        key={i}
                        size={16}
                        className={i <= review.rating ? 'text-accent fill-accent' : 'text-muted-foreground'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-card-foreground">{review.comment}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
