import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { type ComponentType } from "react";
import {
  Accessibility,
  BedDouble,
  Clock3,
  Eye,
  Filter,
  Grid3X3,
  Heart,
  HeartPulse,
  Home,
  Package,
  Phone,
  Search,
  Send,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { useCategories } from "@/hooks/useContent";

type CategoryTile = {
  name: string;
  slug?: string;
  icon?: ComponentType<{ className?: string }> | string;
};

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  accessibility: Accessibility,
  home: Home,
  "bed-double": BedDouble,
  package: Package,
  "heart-pulse": HeartPulse,
  truck: Truck,
  filter: Filter,
  "shield-check": ShieldCheck,
  search: Search,
  "clock-3": Clock3,
  send: Send,
  heart: Heart,
  "grid-3x3": Grid3X3,
  eye: Eye,
  phone: Phone,
  users: Users,
};

function resolveIcon(key?: string) {
  return iconMap[key || ""] || null;
}

const fallbackCategories: CategoryTile[] = [
  { name: "Walking Stick", slug: "walkers", icon: Accessibility },
  { name: "Wheelchair", slug: "wheelchairs", icon: Accessibility },
  { name: "Hospital Bed", slug: "hospital-beds", icon: BedDouble },
  { name: "Oxygen Equipment", slug: "oxygen-equipment", icon: HeartPulse },
  { name: "Commode Chair", slug: "commode-chairs", icon: Home },
  { name: "Patient Monitor", slug: "patient-monitors", icon: HeartPulse },
  { name: "Accessories", slug: "accessories", icon: ShoppingCart },
];

const CategoryGrid = () => {
  const { data: apiCategories } = useCategories();
  const categoryTiles = (apiCategories.length ? apiCategories : fallbackCategories).map((category: any) => ({
    name: String(category.name || "Category"),
    slug: String(category.slug || category.id || ""),
    icon: resolveIcon(category.icon) || category.icon || Accessibility,
  }));

  return (
    <section className="bg-[#eef2f7] py-8 md:py-10">
      <div className="section-container">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            Equipment Categories
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Rent or buy from all major home healthcare categories
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 min-[420px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
          {categoryTiles.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.02, duration: 0.35 }}
            >
              <Link
                to={`/products?category=${encodeURIComponent(cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"))}`}
                className="group flex min-h-[112px] flex-col items-center justify-center rounded-lg border border-[#dde2ec] bg-white px-2 py-3 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:min-h-[126px]"
              >
                <div className="mb-2 rounded-full bg-[#edf2fb] p-2.5 text-[#305da2] transition-transform duration-200 group-hover:scale-105">
                  {typeof cat.icon === "string" ? (
                    <span className="text-xs font-semibold">{cat.icon}</span>
                  ) : (
                    <cat.icon className="h-5 w-5" />
                  )}
                </div>
                <span className="break-words text-[12px] font-medium leading-tight text-[#214f93] sm:text-[13px]">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
