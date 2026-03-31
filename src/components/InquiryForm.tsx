import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

const InquiryForm = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", equipment: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappMsg = `Hi, I'm ${form.name}. I need ${form.equipment}. Please contact me at ${form.phone}.`;
    window.open(
      `https://wa.me/919876543210?text=${encodeURIComponent(whatsappMsg)}`,
      "_blank"
    );
    toast({ title: "Inquiry Sent!", description: "We'll get back to you shortly." });
    setForm({ name: "", phone: "", equipment: "" });
  };

  return (
    <section className="py-16 gradient-hero">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
            Quick Inquiry
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Tell us what you need and we'll get back to you within 30 minutes
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Your Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 rounded-xl"
            />
            <Input
              placeholder="Phone Number"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 rounded-xl"
            />
            <Input
              placeholder="Equipment Needed"
              value={form.equipment}
              onChange={(e) => setForm({ ...form, equipment: e.target.value })}
              required
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 rounded-xl"
            />
            <Button type="submit" className="gradient-cta text-primary-foreground border-0 px-8 rounded-xl shrink-0 hover:opacity-90">
              <Send className="w-4 h-4 mr-2" /> Send
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default InquiryForm;
