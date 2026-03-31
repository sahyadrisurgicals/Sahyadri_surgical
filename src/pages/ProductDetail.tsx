import { useParams, Link } from "react-router-dom";
import { products } from "@/data/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MessageCircle, ChevronRight } from "lucide-react";
import { useState } from "react";

const rentalPlans = [
  { label: "7 Days", days: 7 },
  { label: "15 Days", days: 15 },
  { label: "1 Month", days: 30 },
  { label: "3 Months", days: 90 },
];

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const [selectedPlan, setSelectedPlan] = useState(2);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-container py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/products"><Button>Browse Products</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const planPrice = Math.round((product.rentPrice / 30) * rentalPlans[selectedPlan].days);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />

      <div className="section-container py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-foreground">Products</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-secondary aspect-square">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div>
            <Badge className="mb-3 bg-trust text-primary-foreground border-0">Available</Badge>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              {product.name}
            </h1>
            <p className="text-muted-foreground mb-6">{product.description}</p>

            {/* Pricing */}
            <div className="bg-secondary rounded-2xl p-5 mb-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-primary">₹{planPrice.toLocaleString()}</span>
                <span className="text-muted-foreground">for {rentalPlans[selectedPlan].label}</span>
              </div>

              <p className="text-sm font-medium text-foreground mb-3">Select Rental Plan:</p>
              <div className="grid grid-cols-4 gap-2">
                {rentalPlans.map((plan, i) => (
                  <button
                    key={i}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${selectedPlan === i ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:border-primary"}`}
                    onClick={() => setSelectedPlan(i)}
                  >
                    {plan.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                Buy Price: <span className="font-semibold text-foreground">₹{product.buyPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3 mb-6">
              <a href="tel:+919876543210" className="flex-1">
                <Button className="w-full gradient-cta text-primary-foreground border-0 py-6 text-base rounded-xl hover:opacity-90">
                  <Phone className="w-5 h-5 mr-2" /> Call to Order
                </Button>
              </a>
              <a
                href={`https://wa.me/919876543210?text=Hi, I want to ${selectedPlan <= 1 ? "rent" : "rent"} ${product.name} for ${rentalPlans[selectedPlan].label}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full bg-trust text-primary-foreground py-6 text-base rounded-xl hover:opacity-90">
                  <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
                </Button>
              </a>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="specs">
              <TabsList className="w-full bg-secondary">
                <TabsTrigger value="specs" className="flex-1">Specifications</TabsTrigger>
                <TabsTrigger value="features" className="flex-1">Features</TabsTrigger>
                <TabsTrigger value="faq" className="flex-1">FAQ</TabsTrigger>
              </TabsList>
              <TabsContent value="specs" className="mt-4">
                <ul className="space-y-2">
                  {product.specs.map((spec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-primary mt-1">•</span> {spec}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="features" className="mt-4">
                <ul className="space-y-2">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-trust mt-1">✓</span> {feat}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="faq" className="mt-4 space-y-4">
                {[
                  { q: "How is the equipment delivered?", a: "We provide free doorstep delivery and installation within 24 hours in most cities." },
                  { q: "Is the equipment sanitized?", a: "Yes, all equipment is thoroughly cleaned and sanitized before every delivery." },
                  { q: "What if the equipment malfunctions?", a: "We offer free replacement within 4 hours of reporting any issues." },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-sm font-semibold text-foreground">{item.q}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.a}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
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
