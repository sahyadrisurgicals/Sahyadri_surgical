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
      <div className="section-container px-0 sm:px-6 lg:px-8">
        <div className="flex h-12 items-stretch md:h-[60px]">
          <button
            className="flex w-12 shrink-0 items-center justify-center border-r border-[#e3e8ef] hover:bg-secondary lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex min-w-0 flex-1 shrink items-center gap-2 px-2 sm:flex-none sm:px-0 sm:pr-6 md:border-r md:border-[#e3e8ef]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-hero sm:h-9 sm:w-9 sm:rounded-xl">
              <span className="text-primary-foreground font-display font-bold text-base">S</span>
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-sm font-bold leading-tight text-[#2d5ea9] sm:text-base">Sahyadri</h1>
              <p className="-mt-0.5 truncate text-[10px] text-[#7a8599] sm:text-xs">Surgicals</p>
            </div>
          </Link>

          <nav className="flex h-full shrink-0 items-stretch border-l border-[#e3e8ef] lg:hidden">
            <Link
              to="/products?mode=rent"
              className="flex w-[60px] items-center justify-center border-r border-[#e3e8ef] bg-[#d7e4f5] text-xs font-semibold tracking-wide text-[#2c5aa1] transition-colors hover:bg-[#cdddf2]"
              onClick={() => setIsMenuOpen(false)}
            >
              RENT
            </Link>
            <Link
              to="/products?mode=buy"
              className="flex w-[60px] items-center justify-center border-r border-[#e3e8ef] text-xs font-semibold tracking-wide text-[#2c5aa1] transition-colors hover:bg-[#f4f7fb]"
              onClick={() => setIsMenuOpen(false)}
            >
              BUY
            </Link>
          </nav>

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
