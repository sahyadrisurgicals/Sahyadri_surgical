import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Phone, Menu, X } from "lucide-react";

const callNumber = "+919876543210";
const whatsappNumber = "919876543210";
const whatsappMessage = "Hi, I want to inquire about medical equipment";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#e3e8ef] bg-white header-shadow">
      <div className="section-container">
        <div className="flex h-14 items-center md:h-[60px]">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2 pr-4 sm:pr-6 md:border-r md:border-[#e3e8ef]">
            <div className="h-9 w-9 rounded-xl gradient-hero flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-base">S</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-base leading-tight text-[#2d5ea9]">Sahyadri</h1>
              <p className="text-xs text-[#7a8599] -mt-0.5">Surgicals</p>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 items-center px-4 lg:px-6">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d7380]" />
              <input
                type="text"
                placeholder="Search Products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-sm border border-[#d9dde5] bg-[#f8f9fc] pl-11 pr-4 text-sm text-[#3f4757] placeholder:text-[#a0a8b8] focus:border-[#a7bad7] focus:outline-none focus:ring-1 focus:ring-[#a7bad7]"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <nav className="hidden h-full items-stretch border-l border-[#e3e8ef] lg:flex">
            <Link
              to="/products?mode=rent"
              className="flex items-center justify-center border-r border-[#e3e8ef] bg-[#d7e4f5] px-7 text-sm font-semibold tracking-wide text-[#2c5aa1] transition-colors hover:bg-[#cdddf2]"
            >
              RENT
            </Link>
            <Link
              to="/products?mode=buy"
              className="flex items-center justify-center border-r border-[#e3e8ef] px-7 text-sm font-semibold tracking-wide text-[#2c5aa1] transition-colors hover:bg-[#f4f7fb]"
            >
              BUY
            </Link>
            <Link
              to="/blog"
              className="flex items-center justify-center border-r border-[#e3e8ef] px-7 text-sm font-semibold tracking-wide text-[#2c5aa1] transition-colors hover:bg-[#f4f7fb]"
            >
              BLOG
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden items-center gap-3 pl-4 lg:flex">
            <a
              href={`tel:${callNumber}`}
              className="flex items-center gap-2 rounded-full bg-[#2f5ca6] px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Phone className="h-4 w-4" />
              <span>98765 43210</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#1fae4b] px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <span>WhatsApp</span>
            </a>
          </div>

          <button
            className="ml-auto rounded-lg p-2 hover:bg-secondary lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
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
              { to: "/blog", label: "Blog" },
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
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href={`tel:${callNumber}`}
                className="rounded-xl bg-[#2f5ca6] px-4 py-2 text-sm font-medium text-white"
              >
                Call: 98765 43210
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-[#1fae4b] px-4 py-2 text-sm font-medium text-white"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
