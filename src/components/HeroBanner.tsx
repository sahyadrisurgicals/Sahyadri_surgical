import { useEffect, useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import {
  Accessibility,
  ArrowRight,
  BedDouble,
  ChartColumn,
  HeartPulse,
  Home,
  Package,
  PersonStanding,
  ShieldCheck,
  ShowerHead,
  Syringe,
  Truck,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useHomeContent } from "@/hooks/useContent";

type BannerSlide = {
  id: number;
  badge: string;
  title: string;
  description: string;
  points: string[];
  ctaLabel: string;
  ctaTo: string;
  icon: ComponentType<{ className?: string }>;
  tone: string;
  backgroundImage?: string;
};

const fallbackSlides: BannerSlide[] = [
  {
    id: 1,
    badge: "Limited Time Combo Offers",
    title: "Buy Hospital Bed and Save More",
    description: "Get add-on discounts on air bed, overbed table, IV stand, and wheelchair accessories.",
    points: [
      "Air bed up to 25% off",
      "Food table up to 25% off",
      "IV stand up to 25% off",
      "Extra rental savings on combo orders",
    ],
    ctaLabel: "View Combo Deals",
    ctaTo: "/products?mode=buy",
    icon: BedDouble,
    tone: "from-[#202d83] via-[#293a98] to-[#3249ad]",
  },
  {
    id: 2,
    badge: "Buy & Rent Quality",
    title: "Medical Equipment Delivered Fast",
    description: "Express dispatch, secure payments, and verified devices for home care recovery.",
    points: [
      "Same-day service in major cities",
      "100% sanitized and safety checked",
      "Affordable weekly and monthly plans",
      "Support team available every day",
    ],
    ctaLabel: "Explore Rentals",
    ctaTo: "/products?mode=rent",
    icon: Truck,
    tone: "from-[#1f2b7d] via-[#2a3991] to-[#4256b6]",
  },
  {
    id: 3,
    badge: "ICU At Home Support",
    title: "Critical Care Setup For Home",
    description: "From oxygen concentrators to monitors, we help families create safe home ICU spaces.",
    points: [
      "Equipment planning with experts",
      "On-time delivery and installation",
      "Flexible rent duration options",
      "Priority service for urgent needs",
    ],
    ctaLabel: "ICU At Home",
    ctaTo: "/icu-at-home",
    icon: HeartPulse,
    tone: "from-[#243084] via-[#30439d] to-[#4960bf]",
  },
  {
    id: 4,
    badge: "Mobility Care Specials",
    title: "Wheelchair and Walker Offers",
    description: "Choose lightweight mobility aids for post-surgery and elderly home support.",
    points: [
      "Standard and premium wheelchair variants",
      "Walker and crutches rental plans",
      "Comfort-focused models for long use",
      "Quick replacement on request",
    ],
    ctaLabel: "Shop Mobility Aids",
    ctaTo: "/products?search=wheelchair",
    icon: Accessibility,
    tone: "from-[#212f86] via-[#30429b] to-[#5368c2]",
  },
  {
    id: 5,
    badge: "Trusted Home Healthcare",
    title: "Certified Equipment, Transparent Pricing",
    description: "Quality-tested products with clear rental and purchase options for every family budget.",
    points: [
      "No hidden charges in monthly plans",
      "Fully cleaned before every delivery",
      "Guidance from trained support team",
      "Trusted by families across Maharashtra",
    ],
    ctaLabel: "Talk To Our Team",
    ctaTo: "/contact",
    icon: ShieldCheck,
    tone: "from-[#1d2a79] via-[#2d3f98] to-[#455cb9]",
  },
];

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  "bed-double": BedDouble,
  accessibility: Accessibility,
  "heart-pulse": HeartPulse,
  truck: Truck,
  "shield-check": ShieldCheck,
  home: Home,
  package: Package,
  "chart-column": ChartColumn,
  "person-standing": PersonStanding,
  "shower-head": ShowerHead,
  syringe: Syringe,
  wind: Wind,
};

function resolveIcon(key?: string) {
  return iconMap[key || ""] || BedDouble;
}

function readText(value: unknown, fallback: string) {
  const text = value == null ? "" : String(value).trim();
  return text || fallback;
}

const HeroBanner = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const { data: homeContent } = useHomeContent();

  const visibleSlides = (homeContent?.heroSlides?.length ? homeContent.heroSlides : fallbackSlides).filter((slide: any) => {
    const activeValue = slide?.is_active ?? slide?.isActive;
    if (activeValue === undefined || activeValue === null) {
      return true;
    }

    if (typeof activeValue === "boolean") {
      return activeValue;
    }

    if (typeof activeValue === "number") {
      return activeValue !== 0;
    }

    const normalized = String(activeValue).toLowerCase().trim();
    return !["0", "false", "inactive", "off", "disabled"].includes(normalized);
  });

  const slides: BannerSlide[] = (visibleSlides.length ? visibleSlides : fallbackSlides).map((slide: any, index: number) => ({
    id: Number(slide.id ?? index + 1),
    badge: readText(slide.badge ?? slide.badge_text, fallbackSlides[index % fallbackSlides.length].badge),
    title: readText(slide.title ?? slide.heading, fallbackSlides[index % fallbackSlides.length].title),
    description: readText(slide.description ?? slide.subtitle, fallbackSlides[index % fallbackSlides.length].description),
    points: Array.isArray(slide.points) ? slide.points.map((point) => String(point).trim()).filter(Boolean) : [],
    ctaLabel: readText(slide.ctaLabel ?? slide.cta_label ?? slide.buttonText ?? slide.button_text, fallbackSlides[index % fallbackSlides.length].ctaLabel),
    ctaTo: readText(slide.ctaTo ?? slide.cta_to ?? slide.link ?? slide.href, fallbackSlides[index % fallbackSlides.length].ctaTo),
    icon: typeof slide.icon === "string" ? resolveIcon(slide.icon) : fallbackSlides[index % fallbackSlides.length].icon,
    tone: String(slide.tone ?? fallbackSlides[index % fallbackSlides.length].tone),
    backgroundImage: readText(slide.backgroundImage ?? slide.background_image ?? slide.image, ""),
  }));

  useEffect(() => {
    if (!api) {
      return;
    }

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    handleSelect();
    api.on("select", handleSelect);
    api.on("reInit", handleSelect);

    return () => {
      api.off("select", handleSelect);
      api.off("reInit", handleSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const autoplay = window.setInterval(() => {
      api.scrollNext();
    }, 4500);

    return () => window.clearInterval(autoplay);
  }, [api]);

  return (
    <section className="bg-[#eef2f9]">
      <div className="w-full">
        <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent className="-ml-0">
            {slides.map((slide) => (
              <CarouselItem key={slide.id} className="basis-full pl-0">
                <article
                  className={`relative min-h-[315px] overflow-hidden rounded-none bg-gradient-to-br bg-cover bg-center p-4 text-white sm:p-6 md:min-h-[360px] md:p-8 ${slide.tone}`}
                  style={
                    slide.backgroundImage
                      ? {
                          backgroundImage: `linear-gradient(rgba(25, 35, 90, 0.62), rgba(25, 35, 90, 0.62)), url(${slide.backgroundImage})`,
                        }
                      : undefined
                  }
                >
                  <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full border border-white/20" />
                  <div className="absolute -right-6 bottom-5 hidden h-24 w-24 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm md:flex">
                    <slide.icon className="h-11 w-11 text-white" />
                  </div>
                  <div className="relative z-10 flex h-full flex-col">
                    <div>
                      <p className="inline-flex max-w-full rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
                        {slide.badge}
                      </p>
                      <h2 className="mt-4 max-w-[18rem] font-display text-2xl font-extrabold leading-tight min-[380px]:max-w-md sm:text-3xl md:max-w-xl">
                        {slide.title}
                      </h2>
                      <p className="mt-3 max-w-xl text-sm text-white/85 md:text-base">{slide.description}</p>
                      <ul className="mt-4 space-y-1.5 text-sm leading-6 text-white/90">
                        {slide.points.map((point) => (
                          <li key={point}>- {point}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-6">
                      <Link to={slide.ctaTo}>
                        <Button className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#27358b] hover:bg-[#ecf1ff]">
                          {slide.ctaLabel}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="left-4 top-1/2 hidden h-9 w-9 -translate-y-1/2 border-[#d3dbec] bg-white text-[#2b3c94] hover:bg-[#eef2ff] md:flex" />
          <CarouselNext className="right-4 top-1/2 hidden h-9 w-9 -translate-y-1/2 border-[#d3dbec] bg-white text-[#2b3c94] hover:bg-[#eef2ff] md:flex" />
        </Carousel>

        <div className="flex justify-center gap-2 py-3 md:py-4">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to banner ${index + 1}`}
              onClick={() => api?.scrollTo(index)}
              className={`h-2.5 rounded-full transition-all ${current === index ? "w-6 bg-[#2b52c3]" : "w-2.5 bg-[#bcc8e6]"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
