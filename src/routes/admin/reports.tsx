import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiBarChart2, FiTrendingUp } from "react-icons/fi";
import { motion } from "framer-motion";
import { adminApi } from "@/lib/apiClient";
import { toast } from "sonner";
import { formatPrice } from "@/lib/currency";

export const Route = createFileRoute("/admin/reports")({
  component: AdminReports,
});

function AdminReports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate({ to: "/shop" });
      return;
    }
    fetchReports();
  }, [user, navigate]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getStats();
      const stats = response.data || {};
      setReports({
        totalRevenue: stats.totalRevenue || 0,
        totalOrders: stats.totalOrders || 0,
        totalUsers: stats.totalUsers || 0,
        totalProducts: stats.totalProducts || 0,
      });
    } catch (error) {
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }

  const stats = [
    { label: "Total Revenue", value: formatPrice(reports.totalRevenue), icon: FiTrendingUp, color: "bg-green-500" },
    { label: "Total Orders", value: reports.totalOrders, icon: FiBarChart2, color: "bg-blue-500" },
    { label: "Total Users", value: reports.totalUsers, icon: FiBarChart2, color: "bg-purple-500" },
    { label: "Total Products", value: reports.totalProducts, icon: FiBarChart2, color: "bg-orange-500" },
  ];

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
          <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-6 border border-border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
