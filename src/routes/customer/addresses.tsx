import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiMapPin, FiPlus, FiTrash2, FiX, FiCheck } from "react-icons/fi";

export const Route = createFileRoute("/customer/addresses")({
  component: AddressesPage,
});

function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([
    {
      id: 1,
      name: "Home",
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
      phone: "+1-555-0123",
      isDefault: true,
    },
    {
      id: 2,
      name: "Office",
      street: "456 Work Avenue",
      city: "New York",
      state: "NY",
      zipCode: "10002",
      country: "USA",
      phone: "+1-555-0124",
      isDefault: false,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setFormData({
      name: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      phone: "",
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (address: any) => {
    setFormData(address);
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (editingId) {
      // Update existing
      setAddresses(addresses.map(a => a.id === editingId ? { ...formData, id: editingId } : a));
    } else {
      // Add new
      setAddresses([...addresses, { ...formData, id: Date.now(), isDefault: addresses.length === 0 }]);
    }
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const handleSetDefault = (id: number) => {
    setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/customer" className="inline-flex items-center gap-2 px-6 py-3 mb-8 bg-accent text-accent-foreground rounded-lg hover:bg-orange-hover transition-colors font-semibold shadow-md">
          <FiArrowLeft size={20} /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Saved Addresses</h1>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-orange-hover transition-colors"
          >
            <FiPlus size={18} /> Add New Address
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl shadow-card p-6 mb-8 border-2 border-accent"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {editingId ? "Edit Address" : "Add New Address"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                name="name"
                placeholder="Address Label (e.g., Home, Office)"
                value={formData.name}
                onChange={handleInputChange}
                className="px-4 py-2.5 bg-muted rounded-lg text-foreground outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                className="px-4 py-2.5 bg-muted rounded-lg text-foreground outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="text"
                name="street"
                placeholder="Street Address"
                value={formData.street}
                onChange={handleInputChange}
                className="md:col-span-2 px-4 py-2.5 bg-muted rounded-lg text-foreground outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
                className="px-4 py-2.5 bg-muted rounded-lg text-foreground outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="text"
                name="state"
                placeholder="State/Province"
                value={formData.state}
                onChange={handleInputChange}
                className="px-4 py-2.5 bg-muted rounded-lg text-foreground outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="text"
                name="zipCode"
                placeholder="Zip Code"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="px-4 py-2.5 bg-muted rounded-lg text-foreground outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleInputChange}
                className="px-4 py-2.5 bg-muted rounded-lg text-foreground outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-orange-hover transition-colors font-medium"
              >
                <FiCheck size={18} /> Save Address
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Addresses Grid */}
        {addresses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl shadow-card p-12 text-center"
          >
            <FiMapPin className="mx-auto text-muted-foreground/30 mb-4" size={48} />
            <p className="text-muted-foreground mb-4">No addresses saved yet</p>
            <button
              onClick={handleAddNew}
              className="px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-orange-hover transition-colors"
            >
              Add Your First Address
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {addresses.map((address, index) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl shadow-card p-6 border-2 border-border hover:border-accent transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-accent" size={20} />
                    <h3 className="text-lg font-semibold text-card-foreground">{address.name}</h3>
                  </div>
                  {address.isDefault && (
                    <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-bold rounded">
                      Default
                    </span>
                  )}
                </div>
                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state} {address.zipCode}</p>
                  <p>{address.country}</p>
                  <p className="text-card-foreground font-medium">{address.phone}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="flex-1 px-3 py-2 bg-muted rounded hover:bg-muted/80 transition-colors text-sm font-medium text-card-foreground"
                  >
                    Edit
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="flex-1 px-3 py-2 bg-accent/10 text-accent rounded hover:bg-accent/20 transition-colors text-sm font-medium"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="px-3 py-2 bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

