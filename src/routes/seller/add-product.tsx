import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUpload } from 'react-icons/fi';
import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { productApi } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { CreateProductRequest } from '@/lib/apiTypes';

export const Route = createFileRoute('/seller/add-product')({
  component: AddProductPage,
});

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
  image: z.string().min(1, 'Product image is required'),
  isFeatured: z.boolean().default(false),
  isFlashDeal: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

function AddProductPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors }, setValue } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      condition: 'new',
      isFeatured: false,
      isFlashDeal: false,
      isBestSeller: false,
      isNewArrival: false,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        
        // Compress image by creating a canvas
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize if image is too large
          const maxWidth = 800;
          const maxHeight = 800;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8); // 80% quality
            setImagePreview(compressedBase64);
            setValue('image', compressedBase64);
          }
        };
        img.src = base64;
      };
      reader.readAsDataURL(file);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const payload: CreateProductRequest = {
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
      };
      return productApi.create(payload);
    },
    onSuccess: () => {
      toast.success('Product added successfully!');
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      navigate({ to: '/seller/products' });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createMutation.mutate(data);
  };

  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <button
              onClick={() => navigate({ to: '/seller' })}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <FiArrowLeft size={18} />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="bg-card rounded-xl border border-border p-8 space-y-6"
          >
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
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
              <h2 className="text-lg font-semibold text-foreground mb-4">Pricing & Stock</h2>
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
              <h2 className="text-lg font-semibold text-foreground mb-4">Description</h2>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Product Description *</label>
                    <Textarea {...field} placeholder="Describe your product in detail..." rows={6} />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                  </div>
                )}
              />
            </div>

            {/* Product Image */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Product Image</h2>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Change Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-input"
                      />
                      <label htmlFor="image-input" className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-orange-hover cursor-pointer transition-colors">
                        <FiUpload size={18} />
                        Choose Different Image
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FiUpload size={48} className="mx-auto text-muted-foreground" />
                    <div>
                      <label htmlFor="image-input" className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-orange-hover cursor-pointer transition-colors">
                        <FiUpload size={18} />
                        Upload Product Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-input"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
              {errors.image && <p className="text-red-500 text-sm mt-2">{errors.image.message}</p>}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Additional Details</h2>
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
              <h2 className="text-lg font-semibold text-foreground mb-4">Product Flags</h2>
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
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? 'Adding Product...' : 'Add Product'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/seller' })}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
