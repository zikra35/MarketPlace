import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { adminApi } from '@/lib/apiClient';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { User } from '@/lib/apiTypes';

export const Route = createFileRoute('/admin/users')({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'customers' | 'sellers'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState('');
  const [warnModal, setWarnModal] = useState<{ userId: string; userName: string } | null>(null);
  const [warnReason, setWarnReason] = useState('');

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers({ limit: 100 }),
  });

  const users = response?.data || [];
  
  const customers = users.filter(u => u.role === 'customer');
  const sellers = users.filter(u => u.role === 'seller');

  const filteredCustomers = customers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredSellers = sellers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = !minRating || (u.rating && u.rating >= parseFloat(minRating));
    return matchesSearch && matchesRating;
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const warnSellerMutation = useMutation({
    mutationFn: ({ sellerId, reason }: { sellerId: string; reason: string }) =>
      adminApi.warnSeller(sellerId, reason),
    onSuccess: () => {
      toast.success('Seller warned successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setWarnModal(null);
      setWarnReason('');
    },
  });

  const handleDelete = (userId: string, userName: string, role: string) => {
    const reason = role === 'seller' ? 'seller low rating/violation' : 'bad behavior';
    if (confirm(`Are you sure you want to delete ${userName}? Reason: ${reason}`)) {
      deleteMutation.mutate(userId);
    }
  };

  const handleWarnSeller = () => {
    if (!warnModal || !warnReason.trim()) {
      toast.error('Please enter a warning reason');
      return;
    }
    warnSellerMutation.mutate({ sellerId: warnModal.userId, reason: warnReason });
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
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
            <h1 className="text-3xl font-bold text-foreground">Manage Users</h1>
            <p className="text-sm text-muted-foreground mt-2">Manage customers and sellers on the platform</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 py-6 bg-card border-b border-border">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'customers'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Customers ({filteredCustomers.length})
            </button>
            <button
              onClick={() => setActiveTab('sellers')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'sellers'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Sellers ({filteredSellers.length})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 py-6 bg-card border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {activeTab === 'sellers' && (
              <Input
                type="number"
                placeholder="Filter by minimum rating..."
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                min="0"
                max="5"
                step="0.1"
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : activeTab === 'customers' && filteredCustomers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-card rounded-lg border border-border"
            >
              <p className="text-muted-foreground">No customers found</p>
            </motion.div>
          ) : activeTab === 'sellers' && filteredSellers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-card rounded-lg border border-border"
            >
              <p className="text-muted-foreground">No sellers found</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-lg border border-border overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                      {activeTab === 'sellers' && (
                        <>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Rating</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Warnings</th>
                        </>
                      )}
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Joined</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeTab === 'customers' ? filteredCustomers : filteredSellers).map((user: User) => (
                      <tr key={user._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-foreground font-medium">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                        {activeTab === 'sellers' && (
                          <>
                            <td className="px-6 py-4 text-sm text-foreground">
                              <span className="font-medium">{(user.rating || 0).toFixed(1)}/5</span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {user.sellerStatus && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.sellerStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                  user.sellerStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  user.sellerStatus === 'suspended' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {user.sellerStatus}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {user.warningsCount && user.warningsCount > 0 && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  {user.warningsCount}
                                </span>
                              )}
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(user.createdAt || '').toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2 flex">
                          {activeTab === 'sellers' && (
                            <button
                              onClick={() => setWarnModal({ userId: user._id, userName: user.name })}
                              disabled={warnSellerMutation.isPending}
                              className="p-2 hover:bg-orange-100 rounded transition-colors disabled:opacity-50"
                              title="Warn seller"
                            >
                              <FiAlertCircle size={16} className="text-orange-500" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user._id, user.name, user.role)}
                            disabled={deleteMutation.isPending}
                            className="p-2 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                            title="Delete user"
                          >
                            <FiTrash2 size={16} className="text-red-500" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>

        {/* Warn Modal */}
        {warnModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Warn Seller</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Warning: {warnModal.userName}
              </p>
              <textarea
                placeholder="Enter warning reason (e.g., poor quality products, late shipping, bad reviews)..."
                value={warnReason}
                onChange={(e) => setWarnReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground resize-none mb-4"
                rows={4}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setWarnModal(null);
                    setWarnReason('');
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWarnSeller}
                  disabled={warnSellerMutation.isPending || !warnReason.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {warnSellerMutation.isPending ? 'Warning...' : 'Send Warning'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
