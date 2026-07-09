import { useState, useMemo, type ComponentType } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Filter,
  X,
  Accessibility,
  BedDouble,
  HeartPulse,
  Home,
  Package,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useContent";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  accessibility: Accessibility,
  "bed-double": BedDouble,
  "heart-pulse": HeartPulse,
  home: Home,
  package: Package,
  truck: Truck,
  "shield-check": ShieldCheck,
};

const Products = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [mode, setMode] = useState(searchParams.get("mode") || "rent");
  const [showFilters, setShowFilters] = useState(false);
  const searchQuery = searchParams.get("search") || "";
  const { products, loading, error } = useProducts();
  const { data: categories } = useCategories();

  const filtered = useMemo(() => {
    let result = products;
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />

      <div className="section-container py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-6">
          Home / <span className="text-foreground font-medium">Products</span>
          {searchQuery && <span> / Search: "{searchQuery}"</span>}
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? "fixed inset-0 z-50 overflow-y-auto bg-card p-4 sm:p-6" : "hidden"} shrink-0 lg:relative lg:block lg:w-60`}>
            <div className="flex items-center justify-between lg:hidden mb-4">
              <h3 className="font-display font-bold text-lg">Filters</h3>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
            </div>

            {/* Mode */}
            <div className="mb-6">
              <h4 className="font-semibold text-sm text-foreground mb-3">Mode</h4>
              <div className="flex gap-2">
                {["rent", "buy"].map((m) => (
                  <Button
                    key={m}
                    size="sm"
                    variant={mode === m ? "default" : "outline"}
                    className={mode === m ? "gradient-hero text-primary-foreground border-0" : ""}
                    onClick={() => setMode(m)}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3">Category</h4>
              <div className="space-y-1">
                <button
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${!selectedCategory ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"}`}
                  onClick={() => setSelectedCategory("")}
                >
                  All Categories
                </button>
                {categories.map((cat: any) => {
                  const Icon = iconMap[String(cat.icon || "")];
                  return (
                  <button
                    key={cat.slug || cat.id}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${selectedCategory === String(cat.slug || cat.id) ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"}`}
                    onClick={() => { setSelectedCategory(String(cat.slug || cat.id)); setShowFilters(false); }}
                  >
                    {Icon ? <Icon className="mr-2 inline-block h-4 w-4" /> : <span className="mr-2 inline-block">{String(cat.icon || "")}</span>}
                    {cat.name}
                  </button>
                );})}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading products..." : `${filtered.length} products found`}
              </p>
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowFilters(true)}>
                <Filter className="w-4 h-4 mr-1" /> Filters
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 md:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {!loading && filtered.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg font-semibold mb-2">No products found</p>
                <p className="text-sm">
                  {error ? "Unable to load products from server." : "Try adjusting your filters or search query"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </div>
  );
};

export default Products;
