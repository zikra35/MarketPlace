import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { productApi } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { Product } from '@/lib/apiTypes';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  originalPrice: z.coerce.number().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  stockCount: z.coerce.number().min(0, 'Stock count cannot be negative'),
  condition: z.enum(['new', 'used', 'refurbished']),
  colors: z.string().optional(),
  sizes: z.string().optional(),
  image: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isFlashDeal: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProductModal({ product, onClose, onSuccess }: EditProductModalProps) {
  const queryClient = useQueryClient();
  const { control, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      category: product.category,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      description: product.description,
      stockCount: product.stockCount,
      condition: product.condition,
      colors: product.colors?.join(', '),
      sizes: product.sizes?.join(', '),
      image: product.image,
      isFeatured: product.isFeatured || false,
      isFlashDeal: product.isFlashDeal || false,
      isBestSeller: product.isBestSeller || false,
      isNewArrival: product.isNewArrival || false,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      return productApi.update(product._id, {
        name: data.name,
        category: data.category,
        brand: data.brand,
        price: data.price,
        originalPrice: data.originalPrice,
        description: data.description,
        stockCount: data.stockCount,
        condition: data.condition,
        colors: data.colors ? data.colors.split(',').map(c => c.trim()) : [],
        sizes: data.sizes ? data.sizes.split(',').map(s => s.trim()) : [],
        image: data.image,
        isFeatured: data.isFeatured,
        isFlashDeal: data.isFlashDeal,
        isBestSeller: data.isBestSeller,
        isNewArrival: data.isNewArrival,
      });
    },
    onSuccess: () => {
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      onSuccess();
    },
  });

  const onSubmit = (data: ProductFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Edit Product</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Product Name *</label>
                    <Input {...field} placeholder="Enter product name" />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>
                )}
              />
              <Controller
                name="brand"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Brand *</label>
                    <Input {...field} placeholder="Enter brand name" />
                    {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>}
                  </div>
                )}
              />
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
                    <Input {...field} placeholder="e.g., Electronics, Clothing" />
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                  </div>
                )}
              />
              <Controller
                name="condition"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Condition *</label>
                    <select
                      {...field}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    >
                      <option value="new">New</option>
                      <option value="used">Used</option>
                      <option value="refurbished">Refurbished</option>
                    </select>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Pricing & Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Price (₨) *</label>
                    <Input {...field} type="number" step="0.01" placeholder="0.00" />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                  </div>
                )}
              />
              <Controller
                name="originalPrice"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Original Price (₨)</label>
                    <Input {...field} type="number" step="0.01" placeholder="0.00" />
                  </div>
                )}
              />
              <Controller
                name="stockCount"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Stock Count *</label>
                    <Input {...field} type="number" placeholder="0" />
                    {errors.stockCount && <p className="text-red-500 text-sm mt-1">{errors.stockCount.message}</p>}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Description</h3>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Product Description *</label>
                  <Textarea {...field} placeholder="Describe your product in detail..." rows={4} />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>
              )}
            />
          </div>

          {/* Additional Details */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="colors"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Colors (comma-separated)</label>
                    <Input {...field} placeholder="e.g., Red, Blue, Green" />
                  </div>
                )}
              />
              <Controller
                name="sizes"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Sizes (comma-separated)</label>
                    <Input {...field} placeholder="e.g., S, M, L, XL" />
                  </div>
                )}
              />
            </div>
          </div>

          {/* Toggles */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Product Flags</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'isFeatured', label: 'Featured Product' },
                { name: 'isFlashDeal', label: 'Flash Deal' },
                { name: 'isBestSeller', label: 'Best Seller' },
                { name: 'isNewArrival', label: 'New Arrival' },
              ].map(({ name, label }) => (
                <Controller
                  key={name}
                  name={name as any}
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...field}
                        checked={field.value as boolean}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span className="text-sm text-foreground">{label}</span>
                    </label>
                  )}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Product'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
