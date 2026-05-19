import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground/80">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-lg">S</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-primary-foreground text-lg">Sahyadri</h3>
                <p className="text-xs text-primary-foreground/60 -mt-0.5">Surgicals</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              Your trusted partner for hospital-grade medical equipment at home. Rent or buy with confidence.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-primary-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/products?mode=rent", label: "Rent Equipment" },
                { to: "/products?mode=buy", label: "Buy Equipment" },
                { to: "/icu-at-home", label: "ICU at Home" },
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-primary-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-primary-foreground mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              {["Hospital Beds", "Wheelchairs", "Oxygen Equipment", "Patient Monitors", "Walkers", "BiPAP / CPAP"].map((cat) => (
                <li key={cat}>
                  <Link to="/products" className="hover:text-primary-foreground transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-primary-foreground mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                <a href="tel:+919876543210">+91 98765 43210</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                <a href="mailto:info@sahyadrisurgicals.com">info@sahyadrisurgicals.com</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Pune, Maharashtra, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} Sahyadri Surgicals. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
