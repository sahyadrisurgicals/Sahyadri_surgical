import { Phone, MessageCircle, Home, Grid3X3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useContactSettings, useSiteSettings } from "@/hooks/useContent";
import { SITE_HOME_PATH } from "@/lib/sitePaths";

function stripDigits(value: string) {
  return value.replace(/\D/g, "");
}

const MobileBottomBar = () => {
  const { data: contactSettings } = useContactSettings();
  const { data: siteSettings } = useSiteSettings();
  const callNumber = contactSettings?.phone || String(siteSettings.call_number || "+919876543210");
  const whatsappNumber = stripDigits(contactSettings?.whatsapp || String(siteSettings.whatsapp_number || "919876543210"));
  const whatsappMessage = encodeURIComponent(String(siteSettings.whatsapp_message || "Hi"));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] header-shadow md:hidden">
      <div className="grid grid-cols-4 h-14">
        <Link to={SITE_HOME_PATH} className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-primary">
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link to="/products" className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-primary">
          <Grid3X3 className="w-5 h-5" />
          <span className="text-[10px]">Products</span>
        </Link>
        <a href={`tel:${callNumber}`} className="flex flex-col items-center justify-center gap-0.5 text-primary">
          <Phone className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Call Now</span>
        </a>
        <a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 text-trust"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px] font-semibold">WhatsApp</span>
        </a>
      </div>
    </div>
  );
};

export default MobileBottomBar;
