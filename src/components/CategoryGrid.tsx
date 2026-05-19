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

type CategoryTile = {
  name: string;
  query: string;
  icon: ComponentType<{ className?: string }>;
};

const categoryTiles: CategoryTile[] = [
  { name: "Walking Stick", query: "Walking Stick", icon: Accessibility },
  { name: "Walker", query: "Walker", icon: Accessibility },
  { name: "Crutches", query: "Crutches", icon: Accessibility },
  { name: "Wheelchair", query: "Wheelchair", icon: Accessibility },
  { name: "Commode Chair", query: "Commode Chair", icon: Home },
  { name: "Commode Stool", query: "Commode Stool", icon: Home },
  { name: "Hospital Bed", query: "Hospital Bed", icon: BedDouble },
  { name: "Mattress", query: "Mattress", icon: BedDouble },
  { name: "Food Table", query: "Food Table", icon: Package },
  { name: "IV Stand", query: "IV Stand", icon: Send },
  { name: "Bedside Locker", query: "Bedside Locker", icon: Package },
  { name: "Patient Monitor", query: "Patient Monitor", icon: HeartPulse },
  { name: "Oxygen Concentrator", query: "Oxygen Concentrator", icon: HeartPulse },
  { name: "Oxygen Cylinder", query: "Oxygen Cylinder", icon: Truck },
  { name: "Bipap", query: "Bipap", icon: Filter },
  { name: "CPAP", query: "CPAP", icon: Filter },
  { name: "Ventilator", query: "Ventilator", icon: ShieldCheck },
  { name: "Suction Machine", query: "Suction Machine", icon: Search },
  { name: "DVT Pump", query: "DVT Pump", icon: Clock3 },
  { name: "Syringe Pump", query: "Syringe Pump", icon: Send },
  { name: "Feeding Pump", query: "Feeding Pump", icon: Send },
  { name: "Infusion Pump", query: "Infusion Pump", icon: Send },
  { name: "ECG 12 channel", query: "ECG", icon: Heart },
  { name: "HFNC", query: "HFNC", icon: HeartPulse },
  { name: "Home ICU Setup", query: "Home ICU Setup", icon: Home },
  { name: "Hospital Furniture", query: "Hospital Furniture", icon: Grid3X3 },
  { name: "Sleep Study", query: "Sleep Study", icon: Eye },
  { name: "Hearing Aids", query: "Hearing Aids", icon: Phone },
  { name: "Caretaker", query: "Caretaker", icon: Users },
  { name: "Nursing", query: "Nursing", icon: ShieldCheck },
  { name: "Accessories", query: "Accessories", icon: ShoppingCart },
  { name: "Medical Devices & Equipment", query: "Medical Devices Equipment", icon: Package },
];

const CategoryGrid = () => {
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

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
          {categoryTiles.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.02, duration: 0.35 }}
            >
              <Link
                to={`/products?search=${encodeURIComponent(cat.query)}`}
                className="group flex h-[126px] flex-col items-center justify-center rounded-lg border border-[#dde2ec] bg-white px-2 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-2 rounded-full bg-[#edf2fb] p-2.5 text-[#305da2] transition-transform duration-200 group-hover:scale-105">
                  <cat.icon className="h-5 w-5" />
                </div>
                <span className="text-[13px] font-medium leading-tight text-[#214f93]">
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
