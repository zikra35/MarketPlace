import { createFileRoute } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export const Route = createFileRoute('/seller/settings')({
  component: SellerSettingsPage,
});

const settingsSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

function SellerSettingsPage() {
  const { user } = useAuth();
  const { control, handleSubmit, formState: { errors } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: user?.storeName || '',
      description: user?.description || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: SettingsFormData) =>
      userApi.updateProfile(data),
    onSuccess: () => {
      toast.success('Settings updated successfully');
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <FiArrowLeft size={18} />
              Back
            </button>
            <h1 className="text-3xl font-bold text-foreground">Store Settings</h1>
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
            {/* Store Information */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Store Information</h2>
              <div className="space-y-4">
                <Controller
                  name="storeName"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Store Name *</label>
                      <Input {...field} placeholder="Enter your store name" />
                      {errors.storeName && <p className="text-red-500 text-sm mt-1">{errors.storeName.message}</p>}
                    </div>
                  )}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Store Description</label>
                      <Textarea {...field} placeholder="Tell customers about your store..." rows={4} />
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Contact Information</h2>
              <div className="space-y-4">
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                      <Input {...field} type="tel" placeholder="Enter your phone number" />
                    </div>
                  )}
                />
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                      <Input {...field} placeholder="Enter your address" />
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-border">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
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
