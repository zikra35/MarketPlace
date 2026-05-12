import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiTrash2, FiEdit2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/lib/apiClient";
import { normalizeProducts } from "@/lib/productNormalizer";
import { Input } from "@/components/ui/input";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSeller, setFilterSeller] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      window.location.href = "/shop";
      return;
    }
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productApi.getAll({ limit: 100 });
      const normalized = normalizeProducts(response.data || []);
      setProducts(normalized);
      
      // Extract unique sellers from products
      const uniqueSellers = Array.from(new Map(
        normalized.map((p: any) => [
          typeof p.seller === "object" ? p.seller._id : p.seller,
          typeof p.seller === "object" ? p.seller : { _id: p.seller, name: p.seller }
        ])
      ).values());
      setSellers(uniqueSellers);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => productApi.delete(productId),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      fetchProducts();
    },
  });

  const handleDelete = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(productId);
    }
  };

  // Filter and search
  const filteredProducts = products.filter((p: any) => {
    const matchesCategory = !filterCategory || p.category === filterCategory;
    const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeller = !filterSeller || (typeof p.seller === "object" ? p.seller._id : p.seller) === filterSeller;
    return matchesCategory && matchesSearch && matchesSeller;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const categories = [...new Set(products.map((p: any) => p.category))];

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border-b border-border"
        >
          <div className="max-w-7xl mx-auto px-4 py-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <FiArrowLeft size={18} />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-foreground">Manage Products</h1>
            <p className="text-sm text-muted-foreground mt-2">View all products being sold by sellers</p>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 py-6 bg-card border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={filterSeller}
              onChange={(e) => {
                setFilterSeller(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="">All Sellers</option>
              {sellers.map((seller) => (
                <option key={typeof seller === "object" ? seller._id : seller} value={typeof seller === "object" ? seller._id : seller}>
                  {typeof seller === "object" ? (seller.storeName || seller.name || "Unknown") : seller}
                </option>
              ))}
            </select>
            <div className="text-sm text-muted-foreground flex items-center justify-end">
              Showing {paginatedProducts.length} of {filteredProducts.length}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-xl p-8 border border-border text-center"
            >
              <p className="text-muted-foreground">No products found</p>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Product Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Seller</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Price</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Stock</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Rating</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.map((product: any) => (
                        <tr key={product._id || product.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-foreground font-medium">{product.name}</td>
                          <td className="px-6 py-4 text-sm text-foreground">
                            {typeof product.seller === "object" ? product.seller.storeName || product.seller.name : product.seller}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">${product.price}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{product.stockCount}</td>
                          <td className="px-6 py-4 text-sm text-foreground">
                            <span className="font-medium">{product.rating ? product.rating.toFixed(1) : "N/A"}</span>
                          </td>
                          <td className="px-6 py-4 text-sm flex gap-2">
                            <button
                              disabled={true}
                              className="p-2 hover:bg-blue-100 rounded transition-colors opacity-50 cursor-not-allowed"
                              title="Edit coming soon"
                            >
                              <FiEdit2 size={16} className="text-blue-500" />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id || product.id)}
                              disabled={deleteMutation.isPending}
                              className="p-2 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                              title="Delete product"
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
      </div>
    </ProtectedRoute>
  );
}
