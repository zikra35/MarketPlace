import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { wishlistApi } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/currency';
import { useCart } from '@/context/CartContext';

export const Route = createFileRoute('/account/wishlist')({
  component: WishlistPage,
});

function WishlistPage() {
  const queryClient = useQueryClient();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const { data: response, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.get(),
  });

  // wishlistApi.get() returns the list of (normalized) products
  const wishlistItems = Array.isArray(response?.data) ? response.data : [];

  const removeMutation = useMutation({
    mutationFn: (productId: string) => wishlistApi.remove(productId),
    onSuccess: () => {
      toast.success('Item removed from wishlist');
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const handleRemove = (productId: string) => {
    removeMutation.mutate(productId);
  };

  return (
    <ProtectedRoute allowedRoles={['customer']}>
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
            <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : wishlistItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
              <Button onClick={() => navigate({ to: '/shop' })}>
                Continue Shopping
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {wishlistItems.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {product.image && (
                    <div className="w-full h-48 bg-muted overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{product.category}</p>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-lg font-bold text-foreground">{formatPrice(product.price)}</p>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product.inStock
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        disabled={!product.inStock}
                        onClick={() => addToCart(product as any, product.colors?.[0] || 'Default', product.sizes?.[0])}
                      >
                        <FiShoppingCart className="mr-2" size={16} />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemove(product.id as string)}
                        disabled={removeMutation.isPending}
                      >
                        <FiTrash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
