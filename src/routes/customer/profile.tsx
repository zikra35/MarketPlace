import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/lib/apiClient";
import { toast } from "sonner";

export const Route = createFileRoute("/customer/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
  });

  const [originalData, setOriginalData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
  });

  // Sync form data with user data when user changes
  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
      };
      setFormData(userData);
      setOriginalData(userData);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await userApi.updateProfile({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
      });

      // Update the user context with the new data
      // The API interceptor returns response.data directly, which contains { success: true, data: userObject }
      if (response && response.data) {
        updateUser(response.data);
      }

      setOriginalData(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = error?.message || error?.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/customer" className="inline-flex items-center gap-2 px-6 py-3 mb-8 bg-accent text-accent-foreground rounded-lg hover:bg-orange-hover transition-colors font-semibold shadow-md">
          <FiArrowLeft size={20} /> Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="bg-card rounded-xl shadow-card p-6 border-b-4 border-accent">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-orange-hover rounded-full flex items-center justify-center">
                  <FiUser size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{formData.name}</h1>
                  <p className="text-muted-foreground">{formData.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors font-medium ${
                  isEditing
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    : 'bg-accent text-accent-foreground hover:bg-orange-hover'
                }`}
              >
                {isEditing ? (
                  <>
                    <FiX size={18} /> Cancel
                  </>
                ) : (
                  <>
                    <FiEdit2 size={18} /> Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Profile Form */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-card p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Edit Your Information</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-card-foreground mb-2">
                    <FiUser className="inline mr-2" /> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-muted rounded-lg text-foreground outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-card-foreground mb-2">
                    <FiMail className="inline mr-2" /> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-muted rounded-lg text-foreground outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-card-foreground mb-2">
                    <FiPhone className="inline mr-2" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-muted rounded-lg text-foreground outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-card-foreground mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-muted rounded-lg text-foreground outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-card-foreground mb-2">
                    <FiCalendar className="inline mr-2" /> Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-muted rounded-lg text-foreground outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-card-foreground mb-2">
                    <FiMapPin className="inline mr-2" /> Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-muted rounded-lg text-foreground outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-orange-hover disabled:bg-accent/60 disabled:cursor-not-allowed transition-colors font-bold"
                >
                  <FiCheck size={18} /> {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:bg-muted/60 disabled:cursor-not-allowed transition-colors font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* Profile Display */
            <div className="space-y-4">
              {/* Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-xl shadow-card p-6 hover:shadow-lg transition-shadow"
              >
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <FiUser className="text-accent" /> Full Name
                </p>
                <p className="text-xl font-semibold text-card-foreground">{formData.name}</p>
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-xl shadow-card p-6 hover:shadow-lg transition-shadow"
              >
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <FiMail className="text-accent" /> Email Address
                </p>
                <p className="text-xl font-semibold text-card-foreground">{formData.email}</p>
              </motion.div>

              {/* Phone */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl shadow-card p-6 hover:shadow-lg transition-shadow"
              >
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <FiPhone className="text-accent" /> Phone Number
                </p>
                <p className="text-xl font-semibold text-card-foreground">{formData.phone || "Not added"}</p>
              </motion.div>

              {/* Gender */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-xl shadow-card p-6 hover:shadow-lg transition-shadow"
              >
                <p className="text-sm text-muted-foreground mb-1">Gender</p>
                <p className="text-xl font-semibold text-card-foreground capitalize">{formData.gender || "Not specified"}</p>
              </motion.div>

              {/* Date of Birth */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card rounded-xl shadow-card p-6 hover:shadow-lg transition-shadow"
              >
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <FiCalendar className="text-accent" /> Date of Birth
                </p>
                <p className="text-xl font-semibold text-card-foreground">{formData.dateOfBirth || "Not added"}</p>
              </motion.div>

              {/* Address */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-card rounded-xl shadow-card p-6 hover:shadow-lg transition-shadow"
              >
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <FiMapPin className="text-accent" /> Street Address
                </p>
                <p className="text-xl font-semibold text-card-foreground">{formData.address || "Not added"}</p>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
