import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { createEnquiry } from "@/lib/api";

const InquiryForm = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", equipment: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createEnquiry({
        name: form.name,
        phone: form.phone,
        message: `Equipment needed: ${form.equipment}`,
      });
      toast({ title: "Inquiry Sent!", description: "We'll get back to you shortly." });
      setForm({ name: "", phone: "", equipment: "" });
    } catch {
      toast({ title: "Unable to send", description: "Please try again in a moment." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="gradient-hero py-12 md:py-16">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
            Quick Inquiry
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Tell us what you need and we'll get back to you within 30 minutes
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-nowrap">
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
            <Button
              type="submit"
              disabled={submitting}
              className="w-full shrink-0 rounded-xl border-0 gradient-cta px-8 text-primary-foreground hover:opacity-90 sm:w-auto"
            >
              <Send className="w-4 h-4 mr-2" /> {submitting ? "Sending..." : "Send"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default InquiryForm;
