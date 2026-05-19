import { Phone, MessageCircle, Home, Grid3X3 } from "lucide-react";
import { Link } from "react-router-dom";

const MobileBottomBar = () => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border header-shadow">
      <div className="grid grid-cols-4 h-14">
        <Link to="/" className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-primary">
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link to="/products" className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-primary">
          <Grid3X3 className="w-5 h-5" />
          <span className="text-[10px]">Products</span>
        </Link>
        <a href="tel:+919876543210" className="flex flex-col items-center justify-center gap-0.5 text-primary">
          <Phone className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Call Now</span>
        </a>
        <a
          href="https://wa.me/919876543210?text=Hi"
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
