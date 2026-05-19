import { IndianRupee, ShieldCheck, Truck } from "lucide-react";

const highlights = [
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

const TrustHighlights = () => {
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
