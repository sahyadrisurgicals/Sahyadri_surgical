import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { type ComponentType } from "react";
import {
  Accessibility,
  Armchair,
  BedDouble,
  BedSingle,
  Clock3,
  Eye,
  Filter,
  Grid3X3,
  Heart,
  HeartPulse,
  Home,
  Monitor,
  Package,
  Phone,
  Search,
  Send,
  ShieldCheck,
  ShowerHead,
  ShoppingCart,
  Stethoscope,
  Syringe,
  Table2,
  Truck,
  Users,
  Wind,
} from "lucide-react";
import { useCategories } from "@/hooks/useContent";

type CategoryTile = {
  name: string;
  slug?: string;
  icon?: ComponentType<{ className?: string }>;
  displayOrder?: number;
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
  "shopping-cart": ShoppingCart,
  "bed-single": BedSingle,
  "shower-head": ShowerHead,
  wind: Wind,
  syringe: Syringe,
  "patient-monitor": Monitor,
  monitor: Monitor,
  "icu-setup": Stethoscope,
  "icu-at-home": Stethoscope,
  "iv-stands": Syringe,
  table: Table2,
  "commode-chair": Armchair,
};

function resolveIcon(key?: string) {
  return iconMap[key || ""] || null;
}

const fallbackCategories: CategoryTile[] = [
  { name: "Hospital Beds", slug: "hospital-beds", icon: BedDouble, displayOrder: 1 },
  { name: "Wheelchairs", slug: "wheelchairs", icon: Accessibility, displayOrder: 2 },
  { name: "Oxygen Equipment", slug: "oxygen-equipment", icon: HeartPulse, displayOrder: 3 },
  { name: "Patient Monitors", slug: "patient-monitors", icon: Monitor, displayOrder: 4 },
  { name: "Walkers & Crutches", slug: "walkers", icon: Accessibility, displayOrder: 5 },
  { name: "ICU at Home", slug: "icu-setup", icon: Stethoscope, displayOrder: 6 },
  { name: "Commode Chairs", slug: "commode-chairs", icon: Armchair, displayOrder: 7 },
  { name: "Air Mattresses", slug: "air-mattress", icon: BedSingle, displayOrder: 8 },
  { name: "BiPAP / CPAP", slug: "bipap-cpap", icon: Wind, displayOrder: 9 },
  { name: "Suction Machines", slug: "suction-machines", icon: Syringe, displayOrder: 10 },
  { name: "IV Stands & Tables", slug: "iv-stands", icon: Table2, displayOrder: 11 },
  { name: "Accessories", slug: "accessories", icon: Package, displayOrder: 12 },
];

const CategoryGrid = () => {
  const { data: apiCategories } = useCategories();
  const sourceCategories = apiCategories.length ? apiCategories : fallbackCategories;
  const categoryTiles = sourceCategories
    .filter((category: any) => {
      const active = category.is_active ?? category.isActive;
      return active === undefined || active === null || active === true || Number(active) !== 0;
    })
    .map((category: any, index) => ({
      name: String(category.name || "Category"),
      slug: String(category.slug || category.id || ""),
      icon: resolveIcon(category.icon) || (typeof category.icon === "function" ? category.icon : Package),
      displayOrder: Number(category.display_order ?? category.displayOrder ?? index + 1),
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);

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
                  <cat.icon className="h-5 w-5" />
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
