import { cities } from "@/data/products";
import { MapPin } from "lucide-react";

const CitiesSection = () => {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="section-container text-center">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
          Cities We Serve
        </h2>
        <p className="text-muted-foreground mb-8">Available across Maharashtra & expanding</p>
        <div className="flex flex-wrap justify-center gap-3">
          {cities.map((city) => (
            <span
              key={city}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-card rounded-full card-shadow text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
            >
              <MapPin className="w-3.5 h-3.5" />
              {city}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CitiesSection;
