import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiCreditCard, FiPlus, FiTrash2, FiX, FiCheck } from "react-icons/fi";

export const Route = createFileRoute("/customer/payments")({
  component: PaymentsPage,
});

function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([
    {
      id: 1,
      type: "credit_card",
      cardNumber: "4242424242424242",
      cardHolder: "John Doe",
      expiryDate: "12/25",
      cvv: "123",
      isDefault: true,
    },
    {
      id: 2,
      type: "credit_card",
      cardNumber: "5555555555554444",
      cardHolder: "John Doe",
      expiryDate: "06/26",
      cvv: "456",
      isDefault: false,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    cardHolder: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    
    // Format card number with spaces
    if (name === "cardNumber") {
      value = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
    }
    
    // Format expiry date
    if (name === "expiryDate") {
      value = value.replace(/\D/g, "");
      if (value.length >= 2) {
        value = value.slice(0, 2) + "/" + value.slice(2, 4);
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setFormData({
      cardHolder: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (payment: any) => {
    setFormData({
      cardHolder: payment.cardHolder,
      cardNumber: payment.cardNumber.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim(),
      expiryDate: payment.expiryDate,
      cvv: payment.cvv,
    });
    setEditingId(payment.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (editingId) {
      setPayments(payments.map(p => 
        p.id === editingId 
          ? { ...p, ...formData, cardNumber: formData.cardNumber.replace(/\s/g, "") }
          : p
      ));
    } else {
      setPayments([...payments, {
        ...formData,
        id: Date.now(),
        type: "credit_card",
        cardNumber: formData.cardNumber.replace(/\s/g, ""),
        isDefault: payments.length === 0,
      }]);
    }
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const handleSetDefault = (id: number) => {
    setPayments(payments.map(p => ({ ...p, isDefault: p.id === id })));
  };

  const maskCardNumber = (cardNumber: string) => {
    return "**** **** **** " + cardNumber.slice(-4);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/customer" className="inline-flex items-center gap-2 px-6 py-3 mb-8 bg-accent text-accent-foreground rounded-lg hover:bg-orange-hover transition-colors font-semibold shadow-md">
          <FiArrowLeft size={20} /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Payment Methods</h1>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-orange-hover transition-colors"
          >
            <FiPlus size={18} /> Add Payment Method
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
                {editingId ? "Edit Payment Method" : "Add New Payment Method"}
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
                name="cardHolder"
                placeholder="Cardholder Name"
                value={formData.cardHolder}
                onChange={handleInputChange}
                className="md:col-span-2 px-4 py-2.5 bg-muted rounded-lg text-foreground outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="text"
                name="cardNumber"
                placeholder="Card Number (16 digits)"
                value={formData.cardNumber}
                onChange={handleInputChange}
                maxLength="19"
                className="md:col-span-2 px-4 py-2.5 bg-muted rounded-lg text-foreground outline-none focus:ring-2 focus:ring-accent font-mono"
              />
              <input
                type="text"
                name="expiryDate"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleInputChange}
                maxLength="5"
                className="px-4 py-2.5 bg-muted rounded-lg text-foreground outline-none focus:ring-2 focus:ring-accent font-mono"
              />
              <input
                type="password"
                name="cvv"
                placeholder="CVV"
                value={formData.cvv}
                onChange={handleInputChange}
                maxLength="4"
                className="px-4 py-2.5 bg-muted rounded-lg text-foreground outline-none focus:ring-2 focus:ring-accent font-mono"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-orange-hover transition-colors font-medium"
              >
                <FiCheck size={18} /> Save Payment Method
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

        {/* Payment Cards Grid */}
        {payments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl shadow-card p-12 text-center"
          >
            <FiCreditCard className="mx-auto text-muted-foreground/30 mb-4" size={48} />
            <p className="text-muted-foreground mb-4">No payment methods saved yet</p>
            <button
              onClick={handleAddNew}
              className="px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-orange-hover transition-colors"
            >
              Add Your First Payment Method
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {payments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-card p-6 text-white relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 opacity-20">
                  <FiCreditCard size={40} />
                </div>
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Card Holder</p>
                    <p className="text-lg font-semibold">{payment.cardHolder}</p>
                  </div>
                  {payment.isDefault && (
                    <span className="px-2 py-1 bg-accent/80 text-white text-xs font-bold rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xl tracking-widest font-mono mb-6">{maskCardNumber(payment.cardNumber)}</p>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Expires</p>
                    <p className="font-mono">{payment.expiryDate}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => handleEdit(payment)}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  {!payment.isDefault && (
                    <button
                      onClick={() => handleSetDefault(payment.id)}
                      className="flex-1 px-3 py-2 bg-accent/20 hover:bg-accent/30 rounded text-sm font-medium transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(payment.id)}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/40 rounded transition-colors"
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
