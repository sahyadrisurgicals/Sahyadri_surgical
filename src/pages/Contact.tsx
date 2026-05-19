import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Send, MessageCircle } from "lucide-react";
import { createEnquiry } from "@/lib/api";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const message = `Email: ${form.email || "N/A"}\nMessage: ${form.message}`;
      await createEnquiry({ name: form.name, phone: form.phone, message });
      toast({ title: "Message Sent!", description: "We'll get back to you shortly." });
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch {
      toast({ title: "Unable to send", description: "Please try again in a moment." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />

      <section className="gradient-hero py-16">
        <div className="section-container text-center">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-primary-foreground mb-2">
            Contact Us
          </h1>
          <p className="text-primary-foreground/80">We're here to help 24/7</p>
        </div>
      </section>

      <section className="py-16">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Your Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="rounded-xl"
                />
                <Input
                  placeholder="Phone Number"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="rounded-xl"
                />
                <Input
                  placeholder="Email (optional)"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-xl"
                />
                <Textarea
                  placeholder="Your message..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  rows={4}
                  className="rounded-xl"
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full gradient-cta text-primary-foreground border-0 py-6 rounded-xl hover:opacity-90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-6">Get in touch</h2>

              {[
                { icon: Phone, label: "Phone", value: "+91 98765 43210", href: "tel:+919876543210" },
                { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: "https://wa.me/919876543210" },
                { icon: Mail, label: "Email", value: "info@sahyadrisurgicals.com", href: "mailto:info@sahyadrisurgicals.com" },
                { icon: MapPin, label: "Address", value: "Pune, Maharashtra, India", href: undefined },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-secondary rounded-2xl">
                  <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} className="font-medium text-foreground hover:text-primary">
                        {item.value}
                      </a>
                    ) : (
                      <p className="font-medium text-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Map */}
              <div className="rounded-2xl overflow-hidden h-48">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d242117.68070802!2d73.72288!3d18.524598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf2e67461101%3A0x828d43bf9d9ee343!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Sahyadri Surgicals Location"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </div>
  );
};

export default Contact;
