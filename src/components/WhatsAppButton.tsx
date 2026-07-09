import { MessageCircle } from "lucide-react";
import { useContactSettings, useSiteSettings } from "@/hooks/useContent";

function stripDigits(value: string) {
  return value.replace(/\D/g, "");
}

const WhatsAppButton = () => {
  const { data: contactSettings } = useContactSettings();
  const { data: siteSettings } = useSiteSettings();
  const whatsappNumber = stripDigits(contactSettings?.whatsapp || String(siteSettings.whatsapp_number || "919876543210"));
  const message = encodeURIComponent(String(siteSettings.whatsapp_message || "Hi, I want to inquire about medical equipment"));

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-trust text-primary-foreground shadow-lg transition-transform hover:scale-110 md:bottom-6"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
};

export default WhatsAppButton;
