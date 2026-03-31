import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBanner} alt="Hospital-grade medical equipment for home care" width={1920} height={800} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-transparent" />
      </div>

      <div className="relative section-container py-16 md:py-24 lg:py-32">
        <div className="max-w-2xl">
          <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
            Trusted by 5,000+ Families
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-foreground leading-tight mb-4">
            Hospital-Grade Care,
            <br />
            <span className="text-accent">Delivered to Your Home</span>
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg">
            Rent or buy certified medical equipment with express delivery. Affordable plans starting from just ₹199/day.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/products?mode=rent">
              <Button className="gradient-cta text-primary-foreground border-0 px-8 py-6 text-base font-semibold rounded-xl hover:opacity-90 transition-opacity">
                Explore Rentals <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/products?mode=buy">
              <Button variant="outline" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground px-8 py-6 text-base font-semibold rounded-xl backdrop-blur-sm hover:bg-primary-foreground/20">
                Buy Equipment
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="relative bg-card/95 backdrop-blur-md border-t border-border">
        <div className="section-container py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, label: "Express Delivery", sub: "Same day in most cities" },
              { icon: IndianRupee, label: "Affordable Rentals", sub: "Starting ₹199/day" },
              { icon: ShieldCheck, label: "Certified Equipment", sub: "ISO certified & sanitized" },
              { icon: ShieldCheck, label: "Secure Payments", sub: "100% safe & refundable" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
