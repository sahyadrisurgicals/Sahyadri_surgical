import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";
import { Button } from "@/components/ui/button";
import { Phone, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const packages = [
  {
    name: "Basic Care",
    price: "₹15,000",
    period: "month",
    features: ["Hospital Bed (Semi-Fowler)", "Air Mattress", "Patient Monitor", "Oxygen Concentrator", "24/7 Phone Support"],
    popular: false,
  },
  {
    name: "Advanced Care",
    price: "₹35,000",
    period: "month",
    features: ["Electric Hospital Bed", "Air Mattress", "Multi-Para Monitor", "Oxygen Concentrator", "BiPAP Machine", "Suction Machine", "Dedicated Nurse Visit (2x/week)", "24/7 Support"],
    popular: true,
  },
  {
    name: "Critical Care",
    price: "₹75,000",
    period: "month",
    features: ["Full ICU Bed Setup", "Ventilator", "Multi-Para Monitor", "Infusion Pumps", "Suction Machine", "All Consumables", "24/7 Nurse", "Doctor Visits", "Emergency Response"],
    popular: false,
  },
];

const steps = [
  { step: "01", title: "Free Consultation", desc: "Our medical team assesses the patient's needs and recommends the right package." },
  { step: "02", title: "Equipment Setup", desc: "Certified technicians set up all equipment at your home within 24 hours." },
  { step: "03", title: "Continuous Monitoring", desc: "Regular nurse visits and 24/7 remote monitoring ensure patient safety." },
];

const ICUAtHome = () => {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />

      {/* Hero */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="section-container text-center">
          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-primary-foreground mb-4">
            ICU at Home
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
            Hospital-grade critical care delivered to your doorstep. Save up to 70% compared to hospital ICU charges.
          </p>
          <a href="tel:+919876543210">
            <Button className="gradient-cta text-primary-foreground border-0 px-8 py-6 text-base rounded-xl hover:opacity-90">
              <Phone className="w-5 h-5 mr-2" /> Book Free Assessment
            </Button>
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="section-container">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl gradient-hero text-primary-foreground font-display font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-16 bg-secondary/50">
        <div className="section-container">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
            Choose Your Package
          </h2>
          <p className="text-muted-foreground text-center mb-12">All packages include delivery, setup, and maintenance</p>

          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-card rounded-2xl p-6 card-shadow ${pkg.popular ? "ring-2 ring-primary" : ""}`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="font-display font-bold text-xl text-foreground mb-1">{pkg.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-primary">{pkg.price}</span>
                  <span className="text-muted-foreground text-sm">/ {pkg.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="w-4 h-4 text-trust shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="tel:+919876543210">
                  <Button className={`w-full py-5 rounded-xl ${pkg.popular ? "gradient-cta text-primary-foreground border-0" : ""}`} variant={pkg.popular ? "default" : "outline"}>
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </div>
  );
};

export default ICUAtHome;
