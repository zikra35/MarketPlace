import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiCheck, FiX, FiDownload, FiAlertCircle, FiTrash2, FiEye } from "react-icons/fi";
import { motion } from "framer-motion";
import { adminApi } from "@/lib/apiClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportToCSV, exportToJSON } from "@/lib/exportUtils";

export const Route = createFileRoute("/admin/sellers")({
  component: AdminSellers,
});

function AdminSellers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [warnReason, setWarnReason] = useState("");
  const [showWarnModal, setShowWarnModal] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate({ to: "/shop" });
      return;
    }
    fetchSellers();
  }, [user, navigate]);

  const fetchSellers = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getAllSellers({ status: filterStatus });
      setSellers(response.data || []);
    } catch (error) {
      toast.error("Failed to load sellers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [filterStatus]);

  const handleApproveSeller = async (sellerId: string) => {
    if (confirm("Are you sure you want to approve this seller?")) {
      try {
        setProcessingId(sellerId);
        await adminApi.approveSeller(sellerId);
        toast.success("Seller approved successfully!");
        fetchSellers();
        setSelectedSeller(null);
      } catch (error) {
        toast.error("Failed to approve seller");
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleRejectSeller = async (sellerId: string) => {
    if (confirm("Are you sure you want to reject this seller?")) {
      try {
        setProcessingId(sellerId);
        await adminApi.rejectSeller(sellerId);
        toast.success("Seller rejected successfully!");
        fetchSellers();
        setSelectedSeller(null);
      } catch (error) {
        toast.error("Failed to reject seller");
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleWarnSeller = async () => {
    if (!selectedSeller || !warnReason.trim()) {
      toast.error("Please enter a warning reason");
      return;
    }
    if (confirm("Are you sure you want to warn this seller?")) {
      try {
        setProcessingId(selectedSeller._id);
        await adminApi.warnSeller(selectedSeller._id, warnReason);
        toast.success("Seller warned successfully!");
        fetchSellers();
        setShowWarnModal(false);
        setWarnReason("");
        // Refresh selected seller details
        if (selectedSeller) {
          const updated = sellers.find(s => s._id === selectedSeller._id);
          if (updated) setSelectedSeller(updated);
        }
      } catch (error) {
        toast.error("Failed to warn seller");
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleSuspendSeller = async (sellerId: string) => {
    if (confirm("Are you sure you want to suspend this seller?")) {
      try {
        setProcessingId(sellerId);
        await adminApi.suspendSeller(sellerId, "Suspended by admin");
        toast.success("Seller suspended successfully!");
        fetchSellers();
        setSelectedSeller(null);
      } catch (error) {
        toast.error("Failed to suspend seller");
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleUnsuspendSeller = async (sellerId: string) => {
    if (confirm("Are you sure you want to unsuspend this seller?")) {
      try {
        setProcessingId(sellerId);
        await adminApi.unsuspendSeller(sellerId);
        toast.success("Seller unsuspended successfully!");
        fetchSellers();
        setSelectedSeller(null);
      } catch (error) {
        toast.error("Failed to unsuspend seller");
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleDeleteSeller = async (sellerId: string) => {
    if (confirm("Are you sure you want to DELETE this seller and all their products? This action cannot be undone!")) {
      try {
        setProcessingId(sellerId);
        await adminApi.deleteSeller(sellerId);
        toast.success("Seller deleted successfully!");
        fetchSellers();
        setSelectedSeller(null);
      } catch (error) {
        toast.error("Failed to delete seller");
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleRemoveWarning = async (warningIndex: number) => {
    if (confirm("Are you sure you want to remove this warning?")) {
      try {
        setProcessingId(selectedSeller._id);
        await adminApi.removeWarning(selectedSeller._id, warningIndex);
        toast.success("Warning removed successfully!");
        fetchSellers();
        // Refresh selected seller details
        const updated = sellers.find(s => s._id === selectedSeller._id);
        if (updated) setSelectedSeller(updated);
      } catch (error) {
        toast.error("Failed to remove warning");
      } finally {
        setProcessingId(null);
      }
    }
  };

  // Filter and search
  const filteredSellers = sellers.filter((s: any) => {
    const matchesSearch = !searchTerm || 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.storeName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSellers = filteredSellers.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "suspended":
        return "bg-red-200 text-red-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-b border-border"
      >
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate({ to: "/admin" })}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <FiArrowLeft size={18} />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-foreground">Seller Management</h1>
          <p className="text-sm text-muted-foreground mt-2">Monitor, approve, warn, and manage all sellers</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-6 bg-card border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Sellers</p>
            <p className="text-2xl font-bold text-foreground">{sellers.length}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Pending Approval</p>
            <p className="text-2xl font-bold text-foreground">{sellers.filter(s => s.sellerStatus === 'pending').length}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-foreground">{sellers.filter(s => s.sellerStatus === 'approved').length}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Suspended</p>
            <p className="text-2xl font-bold text-foreground text-red-600">{sellers.filter(s => s.isSuspended).length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-6 bg-card border-b border-border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by name, email, or store..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="all">All Sellers</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="text-sm text-muted-foreground flex items-center">
            Showing {paginatedSellers.length} of {filteredSellers.length}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              exportToCSV(filteredSellers, 'sellers');
              toast.success('Sellers exported as CSV');
            }}
          >
            <FiDownload size={16} className="mr-1" />
            Export CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              exportToJSON(filteredSellers, 'sellers');
              toast.success('Sellers exported as JSON');
            }}
          >
            <FiDownload size={16} className="mr-1" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading sellers...</p>
          </div>
        ) : paginatedSellers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-xl p-8 border border-border text-center"
          >
            <p className="text-muted-foreground">No sellers found</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Store</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Warnings</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSellers.map((seller: any) => (
                    <tr key={seller._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground">{seller.name}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{seller.storeName || "-"}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(seller.sellerStatus || 'pending')}`}>
                          {seller.isSuspended ? "🔒 Suspended" : (seller.sellerStatus || 'pending')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {seller.warningsCount > 0 ? (
                          <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                            <FiAlertCircle size={14} /> {seller.warningsCount}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-1 flex-wrap">
                        <button
                          onClick={() => setSelectedSeller(seller)}
                          className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                        >
                          <FiEye size={14} className="inline mr-1" />
                          View
                        </button>
                        {seller.sellerStatus === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveSeller(seller._id)}
                              disabled={processingId === seller._id}
                              className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50"
                            >
                              <FiCheck size={14} className="inline" />
                            </button>
                            <button
                              onClick={() => handleRejectSeller(seller._id)}
                              disabled={processingId === seller._id}
                              className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50"
                            >
                              <FiX size={14} className="inline" />
                            </button>
                          </>
                        )}
                        {seller.sellerStatus === "approved" && !seller.isSuspended && (
                          <>
                            <button
                              onClick={() => { setSelectedSeller(seller); setShowWarnModal(true); }}
                              disabled={processingId === seller._id}
                              className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200 disabled:opacity-50"
                            >
                              ⚠️ Warn
                            </button>
                            <button
                              onClick={() => handleSuspendSeller(seller._id)}
                              disabled={processingId === seller._id}
                              className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800 hover:bg-orange-200 disabled:opacity-50"
                            >
                              🔒 Suspend
                            </button>
                          </>
                        )}
                        {seller.isSuspended && (
                          <button
                            onClick={() => handleUnsuspendSeller(seller._id)}
                            disabled={processingId === seller._id}
                            className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50"
                          >
                            🔓 Unsuspend
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteSeller(seller._id)}
                          disabled={processingId === seller._id}
                          className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50"
                        >
                          <FiTrash2 size={14} className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 hover:bg-muted rounded disabled:opacity-50"
                >
                  <FiChevronLeft size={18} />
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 hover:bg-muted rounded disabled:opacity-50"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Warn Modal */}
      {showWarnModal && selectedSeller && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-bold text-foreground mb-4">Warn Seller: {selectedSeller.name}</h3>
            <textarea
              value={warnReason}
              onChange={(e) => setWarnReason(e.target.value)}
              placeholder="Enter warning reason..."
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground mb-4 h-24"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleWarnSeller}
                disabled={processingId === selectedSeller._id}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              >
                Issue Warning
              </Button>
              <Button
                onClick={() => { setShowWarnModal(false); setWarnReason(""); }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Seller Details Modal */}
      {selectedSeller && !showWarnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Seller Details</h2>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="text-foreground">{selectedSeller.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-foreground">{selectedSeller.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-foreground">{selectedSeller.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Applied Date</p>
                    <p className="text-foreground">{new Date(selectedSeller.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Store Info */}
              <div className="border-t border-border pt-4">
                <h3 className="font-semibold text-foreground mb-3">Store Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Store Name</p>
                    <p className="text-foreground">{selectedSeller.storeName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="text-foreground">{selectedSeller.address || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className={`text-foreground font-semibold ${getStatusBadgeColor(selectedSeller.sellerStatus || 'pending')}`}>
                      {selectedSeller.isSuspended ? "🔒 SUSPENDED" : (selectedSeller.sellerStatus || "pending").toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              <div className="border-t border-border pt-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FiAlertCircle size={18} />
                  Warnings ({selectedSeller.warningsCount || 0})
                </h3>
                {selectedSeller.warnings && selectedSeller.warnings.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSeller.warnings.map((warning: any, index: number) => (
                      <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-yellow-800">{warning.reason}</p>
                            <p className="text-xs text-yellow-600 mt-1">
                              {new Date(warning.issuedAt).toLocaleDateString()} at {new Date(warning.issuedAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveWarning(index)}
                            disabled={processingId === selectedSeller._id}
                            className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No warnings issued</p>
                )}
              </div>

              {/* Stats */}
              <div className="border-t border-border pt-4">
                <h3 className="font-semibold text-foreground mb-3">Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="text-foreground font-semibold">{selectedSeller.totalSales || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="text-foreground font-semibold">⭐ {selectedSeller.rating || 0}/5</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-border pt-4 flex flex-col gap-2">
                {selectedSeller.sellerStatus === "pending" && (
                  <>
                    <Button
                      onClick={() => handleApproveSeller(selectedSeller._id)}
                      disabled={processingId === selectedSeller._id}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <FiCheck size={16} className="mr-2" />
                      Approve Seller
                    </Button>
                    <Button
                      onClick={() => handleRejectSeller(selectedSeller._id)}
                      disabled={processingId === selectedSeller._id}
                      variant="destructive"
                      className="w-full"
                    >
                      <FiX size={16} className="mr-2" />
                      Reject Seller
                    </Button>
                  </>
                )}
                {selectedSeller.sellerStatus === "approved" && !selectedSeller.isSuspended && (
                  <>
                    <Button
                      onClick={() => { setShowWarnModal(true); }}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      ⚠️ Issue Warning
                    </Button>
                    <Button
                      onClick={() => handleSuspendSeller(selectedSeller._id)}
                      disabled={processingId === selectedSeller._id}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      🔒 Suspend Seller
                    </Button>
                  </>
                )}
                {selectedSeller.isSuspended && (
                  <Button
                    onClick={() => handleUnsuspendSeller(selectedSeller._id)}
                    disabled={processingId === selectedSeller._id}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    🔓 Unsuspend Seller
                  </Button>
                )}
                <Button
                  onClick={() => handleDeleteSeller(selectedSeller._id)}
                  disabled={processingId === selectedSeller._id}
                  variant="destructive"
                  className="w-full"
                >
                  <FiTrash2 size={16} className="mr-2" />
                  Delete Seller & Products
                </Button>
                <Button
                  onClick={() => setSelectedSeller(null)}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
