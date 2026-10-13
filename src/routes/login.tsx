import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiShoppingBag } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [role, setRole] = useState<'customer' | 'seller'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toast.error('Please fill in all fields');
      return;
    }
    if (role === 'seller' && !storeName) {
      toast.error('Please enter a store name');
      return;
    }
    setIsLoading(true);
    try {
      await register(email, password, name, role, role === 'seller' ? storeName : undefined);
      setEmail("");
      setPassword("");
      setName("");
      setStoreName("");
      setRole('customer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">{isRegister ? "Create Account" : "Welcome Back"}</h1>
          <p className="text-sm text-muted-foreground mt-1">{isRegister ? "Join our marketplace" : "Sign in to your account"}</p>
        </div>

        <form className="space-y-4" onSubmit={isRegister ? handleRegister : handleLogin}>
          {isRegister && (
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                type="text" 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          )}
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10"
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 pr-10"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>

          {isRegister && (
            <>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Register as:</p>
                <div className="flex gap-2">
                  {(['customer', 'seller'] as const).map(r => (
                    <button 
                      key={r} 
                      type="button" 
                      onClick={() => setRole(r)}
                      className={`flex-1 py-2 rounded-lg border text-sm transition-colors capitalize ${
                        role === r 
                          ? "border-accent bg-accent/10 text-accent font-semibold" 
                          : "border-border text-muted-foreground hover:border-accent hover:text-accent"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {role === 'seller' && (
                <div className="relative">
                  <FiShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    type="text" 
                    placeholder="Store Name" 
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              )}
            </>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 bg-accent text-accent-foreground font-bold rounded-lg hover:bg-accent/90 transition-colors"
          >
            {isLoading ? (isRegister ? "Creating Account..." : "Signing In...") : (isRegister ? "Create Account" : "Sign In")}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsRegister(!isRegister)} className="text-accent font-semibold hover:underline">
            {isRegister ? "Sign In" : "Register"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
