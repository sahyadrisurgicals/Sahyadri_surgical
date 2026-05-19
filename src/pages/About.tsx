import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";
import { ShieldCheck, Heart, Eye, Users } from "lucide-react";
import { motion } from "framer-motion";

const values = [
  { icon: Heart, title: "Patient-First", desc: "Every decision we make starts with what's best for the patient and their family." },
  { icon: ShieldCheck, title: "Quality Assured", desc: "ISO-certified equipment, sanitized and maintained to hospital standards." },
  { icon: Eye, title: "Transparency", desc: "Clear pricing, no hidden charges, and honest communication always." },
  { icon: Users, title: "Expert Team", desc: "Trained biomedical engineers and healthcare professionals at your service." },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />

      <section className="gradient-hero py-16 md:py-24">
        <div className="section-container text-center">
          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-primary-foreground mb-4">
            About Sahyadri Surgicals
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Making hospital-grade care accessible and affordable for every home in India.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Sahyadri Surgicals was founded with a simple mission: to bridge the gap between hospital care and home recovery. We understand that patients recovering at home need the same quality equipment they'd find in a hospital — but at an affordable price.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, we serve thousands of families across Maharashtra, providing everything from basic walkers to complete ICU setups at home. Our team of biomedical engineers ensures every piece of equipment is certified, sanitized, and ready for use.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/50">
        <div className="section-container">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Our Values
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 card-shadow text-center"
              >
                <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
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

export default About;
