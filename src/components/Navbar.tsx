import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

const categories = [
  "Electronics", "Fashion", "Home & Garden", "Sports", "Books",
  "Beauty", "Toys", "Automotive", "Health", "Groceries"
];

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/shop", search: { q: searchQuery.trim() } });
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  const handleAccountClick = () => {
    if (user?.role === 'admin') {
      navigate({ to: '/admin' });
    } else if (user?.role === 'seller') {
      navigate({ to: '/seller' });
    } else {
      navigate({ to: '/customer' });
    }
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Main navbar */}
      <div className="gradient-navy">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <h1 className="text-xl md:text-2xl font-bold text-navy-foreground">
              Market<span className="text-accent">Place</span>
            </h1>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="flex w-full rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder="Search products, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm bg-card text-card-foreground outline-none"
              />
              <button type="submit" className="px-5 bg-accent text-accent-foreground hover:bg-orange-hover transition-colors">
                <FiSearch size={18} />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-3 ml-auto">
            <Link to="/wishlist" className="relative p-2 text-navy-foreground hover:text-accent transition-colors">
              <FiHeart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative p-2 text-navy-foreground hover:text-accent transition-colors">
              <FiShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <div className="relative">
              <button
                onClick={() => {
                  if (!user) {
                    navigate({ to: '/login' });
                  } else {
                    setUserMenuOpen(!userMenuOpen);
                  }
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-navy-foreground hover:text-accent transition-colors text-sm"
              >
                <FiUser size={18} />
                <span>{user ? user.name : 'Account'}</span>
              </button>
              {userMenuOpen && user && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-50">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    {user.role && <p className="text-xs text-muted-foreground capitalize">Role: {user.role}</p>}
                  </div>
                  <button
                    onClick={handleAccountClick}
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors border-b border-border"
                  >
                    {user.role === 'admin' ? 'Admin Dashboard' : user.role === 'seller' ? 'Seller Dashboard' : 'My Account'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <FiLogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
            <button
              className="md:hidden p-2 text-navy-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="md:hidden px-4 pb-3">
          <div className="flex rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 text-sm bg-card text-card-foreground outline-none"
            />
            <button type="submit" className="px-4 bg-accent text-accent-foreground">
              <FiSearch size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Categories bar */}
      <div className="bg-navy-light overflow-x-auto hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 py-2">
          {categories.map((cat) => (
            <Link
              key={cat}
              to="/shop"
              className="text-xs text-navy-foreground/80 hover:text-accent whitespace-nowrap transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border">
          <div className="px-4 py-3 space-y-2">
            {user ? (
              <>
                <div className="py-2 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <button
                  onClick={handleAccountClick}
                  className="w-full text-left flex items-center gap-2 py-2 text-sm text-foreground"
                >
                  <FiUser size={16} /> {user.role === 'admin' ? 'Admin Dashboard' : user.role === 'seller' ? 'Seller Dashboard' : 'My Account'}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 py-2 text-sm text-destructive"
                >
                  <FiLogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-2 py-2 text-sm text-foreground" onClick={() => setMobileMenuOpen(false)}>
                <FiUser size={16} /> Account
              </Link>
            )}
            <div className="border-t border-border pt-2">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to="/shop"
                  className="block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
