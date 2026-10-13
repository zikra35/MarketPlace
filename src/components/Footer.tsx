import { Link } from "@tanstack/react-router";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="gradient-navy text-navy-foreground">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Market<span className="text-accent">Place</span></h3>
            <p className="text-sm text-navy-foreground/70 leading-relaxed">
              Your trusted multi-vendor marketplace. Discover millions of products from verified sellers worldwide.
            </p>
            <div className="flex gap-3 mt-4">
              {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg bg-navy-foreground/10 hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-navy-foreground/70">
              {["About Us", "Contact", "FAQs", "Shipping Policy", "Returns"].map(l => (
                <li key={l}><a href="#" className="hover:text-accent transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-navy-foreground/70">
              {["My Account", "Track Order", "Wishlist", "Become a Seller"].map(l => (
                <li key={l}><a href="#" className="hover:text-accent transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm text-navy-foreground/70">
              <li className="flex items-center gap-2"><FiMapPin size={14} /> 123 Market Street, NY</li>
              <li className="flex items-center gap-2"><FiPhone size={14} /> +1 (555) 123-4567</li>
              <li className="flex items-center gap-2"><FiMail size={14} /> support@marketplace.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-navy-foreground/10 mt-8 pt-6 text-center text-xs text-navy-foreground/50">
          © 2026 MarketPlace. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
