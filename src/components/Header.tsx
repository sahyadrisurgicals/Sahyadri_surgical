import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Phone, Menu, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card header-shadow">
      <div className="section-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">S</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-lg leading-tight text-foreground">Sahyadri</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Surgicals</p>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-xl border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </form>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link to="/products?mode=rent">
              <Button variant="ghost" className="text-sm font-semibold text-primary hover:bg-secondary">
                RENT
              </Button>
            </Link>
            <Link to="/products?mode=buy">
              <Button variant="ghost" className="text-sm font-semibold text-primary hover:bg-secondary">
                BUY
              </Button>
            </Link>
            <Link to="/icu-at-home">
              <Button variant="ghost" className="text-sm font-medium hover:bg-secondary">
                ICU at Home
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost" className="text-sm font-medium hover:bg-secondary">
                About
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost" className="text-sm font-medium hover:bg-secondary">
                Contact
              </Button>
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 ml-2">
            <a href="tel:+919876543210" className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
              <Phone className="w-4 h-4" />
              <span>Call Now</span>
            </a>
            <a
              href="https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20inquire%20about%20medical%20equipment"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-trust text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              WhatsApp
            </a>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-secondary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-card border-t border-border animate-fade-in">
          <div className="section-container py-4 space-y-2">
            <form onSubmit={handleSearch} className="md:hidden mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </form>
            {[
              { to: "/products?mode=rent", label: "Rent Equipment" },
              { to: "/products?mode=buy", label: "Buy Equipment" },
              { to: "/icu-at-home", label: "ICU at Home" },
              { to: "/about", label: "About Us" },
              { to: "/contact", label: "Contact" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-4 py-3 rounded-xl hover:bg-secondary text-foreground font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
