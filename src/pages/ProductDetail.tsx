import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";
import ProductCard from "@/components/ProductCard";
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
import { useContactSettings, useSiteSettings } from "@/hooks/useContent";

function stripDigits(value: string) {
  return value.replace(/\D/g, "");
}

const ProductDetail = () => {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const { data: contactSettings } = useContactSettings();
  const { data: siteSettings } = useSiteSettings();
  const product = products.find((item) => item.id === id || item.slug === id);

  const phoneNumber = contactSettings?.phone || String(siteSettings.call_number || "+919876543210");
  const whatsappNumber = stripDigits(contactSettings?.whatsapp || String(siteSettings.whatsapp_number || "919876543210"));
  const whatsappMessage = encodeURIComponent(
    String(siteSettings.whatsapp_message || `Hi, I want to inquire about ${product?.name || "a product"}`)
  );

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((item) => item.id !== product.id && item.category === product.category)
      .slice(0, 4);
  }, [product, products]);

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

  const displayImage = product.images?.[0] || product.image;

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
            <img src={displayImage} alt={product.name} className="h-full w-full object-cover" />
          </div>

          <div>
            <Badge className="mb-3 border-0 bg-trust text-primary-foreground">
              {product.available ? "Available" : "Unavailable"}
            </Badge>
            <h1 className="mb-2 font-display text-2xl font-bold text-foreground md:text-3xl">
              {product.name}
            </h1>
            <p className="mb-6 text-muted-foreground">{product.description}</p>

            <div className="mb-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
              <a href={`tel:${phoneNumber}`} className="min-w-0">
                <Button className="w-full rounded-xl border-0 gradient-cta py-6 text-base text-primary-foreground hover:opacity-90">
                  <Phone className="mr-2 h-5 w-5" /> Call to Order
                </Button>
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
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
                    {product.name}
                  </h2>
                  <p className="mt-3 text-base leading-7 text-[#344054]">{product.description}</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="features" className="overflow-hidden rounded-xl border-2 border-black bg-white shadow-sm transition-shadow hover:shadow-md sm:rounded-2xl">
                <AccordionTrigger className="px-4 py-3 text-left font-display text-base font-semibold text-black hover:no-underline sm:px-5 sm:py-4 md:text-lg">
                  Features
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-0 sm:px-5 sm:pb-6">
                  <ul className="space-y-3 text-base leading-7 text-[#202124]">
                    {(product.features.length > 0 ? product.features : ["Reliable equipment"]).map((feature) => (
                      <li key={feature} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full border border-black" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="specifications" className="overflow-hidden rounded-xl border-2 border-black bg-white shadow-sm transition-shadow hover:shadow-md sm:rounded-2xl">
                <AccordionTrigger className="px-4 py-3 text-left font-display text-base font-semibold text-black hover:no-underline sm:px-5 sm:py-4 md:text-lg">
                  Specifications
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-0 sm:px-5 sm:pb-6">
                  <ul className="space-y-3 text-base leading-7 text-[#202124]">
                    {(product.specs.length > 0 ? product.specs : ["Contact our team for detailed specifications"]).map(
                      (spec) => (
                        <li key={spec} className="flex gap-3">
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full border border-black" />
                          <span>{spec}</span>
                        </li>
                      )
                    )}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="benefits" className="overflow-hidden rounded-xl border-2 border-black bg-white shadow-sm transition-shadow hover:shadow-md sm:rounded-2xl">
                <AccordionTrigger className="px-4 py-3 text-left font-display text-base font-semibold text-black hover:no-underline sm:px-5 sm:py-4 md:text-lg">
                  Benefits
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-0 sm:px-5 sm:pb-6">
                  <ul className="space-y-3 text-base leading-7 text-[#202124]">
                    {(product.benefits?.length ? product.benefits : ["Durable build", "Easy support", "Fast delivery"]).map(
                      (benefit) => (
                        <li key={benefit} className="flex gap-3">
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full border border-black" />
                          <span>{benefit}</span>
                        </li>
                      )
                    )}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Related Products</h2>
                <p className="text-sm text-muted-foreground">More equipment in the same category</p>
              </div>
              <Link to="/products" className="text-sm font-semibold text-[#2c5aa1] hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </div>
  );
};

export default ProductDetail;

