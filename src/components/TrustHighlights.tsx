import { IndianRupee, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import { useHomeContent } from "@/hooks/useContent";

const fallbackHighlights = [
  {
    title: "Express Delivery",
    subtitle: "Same day in most cities",
    icon: Truck,
  },
  {
    title: "Affordable Rentals",
    subtitle: "Starting Rs 199/day",
    icon: IndianRupee,
  },
  {
    title: "Certified Equipment",
    subtitle: "ISO certified & sanitized",
    icon: ShieldCheck,
  },
  {
    title: "Secure Payments",
    subtitle: "100% safe & refundable",
    icon: ShieldCheck,
  },
];

const iconMap: Record<string, LucideIcon> = {
  truck: Truck,
  "indian-rupee": IndianRupee,
  "shield-check": ShieldCheck,
};

function isActiveItem(item: any) {
  const value = item?.is_active ?? item?.isActive;
  if (value === undefined || value === null) return true;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const normalized = String(value).toLowerCase().trim();
  return !["0", "false", "inactive", "off", "disabled"].includes(normalized);
}

const TrustHighlights = () => {
  const { data: homeContent } = useHomeContent();
  const sourceHighlights = (homeContent?.trustHighlights?.length ? homeContent.trustHighlights : fallbackHighlights).filter(isActiveItem);
  const highlights = (sourceHighlights.length ? sourceHighlights : fallbackHighlights).map(
    (item: any, index: number) => ({
      title: String(item.title ?? fallbackHighlights[index % fallbackHighlights.length].title),
      subtitle: String(item.subtitle ?? fallbackHighlights[index % fallbackHighlights.length].subtitle),
      icon: iconMap[String(item.icon ?? "")] || fallbackHighlights[index % fallbackHighlights.length].icon,
    })
  );

  return (
    <section className="bg-[#f2f4f6] py-3 md:py-4">
      <div className="mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="flex items-center gap-3 rounded-lg border border-[#e1e6ea] bg-white px-4 py-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf4f3] text-[#0b8a8c]">
                <item.icon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#1f2328]">{item.title}</h3>
                <p className="text-xs text-[#69727d]">{item.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustHighlights;
