import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Phone, MessageCircle, ChevronRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

const tripodProductInfo = {
  description: {
    title: "Maximum Base Stability.",
    text: "An enhanced mobility aid featuring a broad three-pronged base. It is engineered specifically for patients who require significantly more weight-bearing balance, fall prevention, and the convenience of a stick that stays upright on its own.",
  },
  features: [
    {
      title: "Self-Standing Tripod Base",
      text: "Three wide-set legs ensure the stick remains upright when let go, eliminating the need for patients to bend down to retrieve a fallen stick.",
    },
    {
      title: "Broad-Load Support",
      text: "Distributes body weight across a wider surface area compared to standard sticks, offering superior stabilization for senior citizens or stroke recovery patients.",
    },
    {
      title: "Dual-Sided Orientation",
      text: "The base is specially angled to clear space for the patient's feet, preventing accidental tripping during strides.",
    },
    {
      title: "Heavy-Duty Aluminium & Non-Slip Tips",
      text: "Constructed from reinforced, rust-resistant tubing paired with three high-traction rubber pods for total floor grip.",
    },
  ],
  guide: [
    {
      heading: "1. Perfecting the Height",
      points: [
        {
          title: "The Measurement",
          text: "The patient should stand upright wearing daily footwear. Relax the arm at the side; the handle must line up precisely with the wrist crease.",
        },
        {
          title: "The Adjustment",
          text: "Depress the copper or steel push-pin on the main shaft and slide to the proper slot. Ensure the elbow maintains a comfortable 15-to-20 degree bend during use.",
        },
      ],
    },
    {
      heading: "2. Correct Walking Placement",
      points: [
        {
          title: "The Flat Base Rule",
          text: "Ensure all three rubber legs touch the floor at the exact same time with every step. Landing on just one or two edges reduces stability and causes uneven wear.",
        },
        {
          title: "The Clearance Facing",
          text: "Look at the base configuration. The flatter side of the tripod base should face inward toward the patient's body to maximize leg room, while the extended prong faces outward to avoid tripping.",
        },
        {
          title: "Coordination",
          text: "Hold the tripod stick in the hand opposite to the weak or injured leg. Advance the stick and the weak leg simultaneously, then follow through with the strong leg.",
        },
      ],
    },
    {
      heading: "3. Stair Safety Note",
      intro:
        "A tripod stick has a wider footprint. For standard narrow stair steps, the base may be wider than the step depth.",
      points: [
        {
          title: "The Rule",
          text: "If the 3-leg base does not fit entirely flat on a step, do not use it on the stairs. Instead, use the wall handrail with one hand while holding the folded stick in the other, or utilize a standard single-point stick for stair transitions.",
        },
      ],
    },
  ],
};

const ProductDetail = () => {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const product = products.find((p) => p.id === id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-container py-20 text-center">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-container py-20 text-center">
          <h2 className="mb-4 text-2xl font-bold">Product not found</h2>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const productInfo =
    product.id === "tripod-walking-stick"
      ? tripodProductInfo
      : {
          description: {
            title: product.name,
            text: product.description,
          },
          features:
            product.features.length > 0
              ? product.features.map((feature) => ({ title: feature, text: "" }))
              : [{ title: "Reliable Equipment", text: "Designed for dependable home-care support." }],
          guide: [
            {
              heading: "Specifications",
              points:
                product.specs.length > 0
                  ? product.specs.map((spec) => ({ title: spec, text: "" }))
                  : [{ title: "Product Guidance", text: "Contact our team for usage, setup, and rental details." }],
            },
          ],
        };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />

      <div className="section-container py-6">
        <div className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-foreground">
            Products
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-foreground">{product.name}</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-12">
          <div className="aspect-square overflow-hidden rounded-2xl bg-secondary md:sticky md:top-20 md:self-start">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>

          <div>
            <Badge className="mb-3 border-0 bg-trust text-primary-foreground">Available</Badge>
            <h1 className="mb-2 font-display text-2xl font-bold text-foreground md:text-3xl">
              {product.name}
            </h1>
            <p className="mb-6 text-muted-foreground">{product.description}</p>

            <div className="mb-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
              <a href="tel:+919876543210" className="min-w-0">
                <Button className="w-full rounded-xl border-0 gradient-cta py-6 text-base text-primary-foreground hover:opacity-90">
                  <Phone className="mr-2 h-5 w-5" /> Call to Order
                </Button>
              </a>
              <a
                href={`https://wa.me/919876543210?text=Hi, I want to rent ${product.name} on monthly rent`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0"
              >
                <Button className="w-full rounded-xl bg-trust py-6 text-base text-primary-foreground hover:opacity-90">
                  <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
                </Button>
              </a>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              <AccordionItem value="description" className="overflow-hidden rounded-xl border-2 border-black bg-white shadow-sm transition-shadow hover:shadow-md sm:rounded-2xl">
                <AccordionTrigger className="px-4 py-3 text-left font-display text-base font-semibold text-black hover:no-underline sm:px-5 sm:py-4 md:text-lg">
                  Product Description
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-0 sm:px-5 sm:pb-6">
                  <h2 className="font-display text-lg font-semibold text-[#202124] md:text-xl">
                    {productInfo.description.title}
                  </h2>
                  <p className="mt-3 text-base leading-7 text-[#344054]">
                    {productInfo.description.text}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="features" className="overflow-hidden rounded-xl border-2 border-black bg-white shadow-sm transition-shadow hover:shadow-md sm:rounded-2xl">
                <AccordionTrigger className="px-4 py-3 text-left font-display text-base font-semibold text-black hover:no-underline sm:px-5 sm:py-4 md:text-lg">
                  Features
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-0 sm:px-5 sm:pb-6">
                  <ul className="space-y-3 text-base leading-7 text-[#202124]">
                    {productInfo.features.map((feature) => (
                      <li key={feature.title} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full border border-black" />
                        <span>
                          {feature.text ? (
                            <>
                              <strong>{feature.title}</strong>: {feature.text}
                            </>
                          ) : (
                            feature.title
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="usage" className="overflow-hidden rounded-xl border-2 border-black bg-white shadow-sm transition-shadow hover:shadow-md sm:rounded-2xl">
                <AccordionTrigger className="px-4 py-3 text-left font-display text-base font-semibold text-black hover:no-underline sm:px-5 sm:py-4 md:text-lg">
                  Usage & Adjustment Guide
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-0 sm:px-5 sm:pb-6">
                  <div className="space-y-6 text-base leading-7 text-[#202124]">
                    {productInfo.guide.map((section) => (
                      <div key={section.heading}>
                        <h3 className="font-display text-lg font-semibold text-black">{section.heading}</h3>
                        {section.intro ? <p className="mt-2">{section.intro}</p> : null}
                        <ul className="mt-3 space-y-3">
                          {section.points.map((point) => (
                            <li key={point.title} className="flex gap-3">
                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full border border-black" />
                              <span>
                                {point.text ? (
                                  <>
                                    <strong>{point.title}</strong>: {point.text}
                                  </>
                                ) : (
                                  point.title
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </div>
  );
};

export default ProductDetail;
