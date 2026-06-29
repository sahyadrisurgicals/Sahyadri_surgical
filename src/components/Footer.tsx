import { Link } from "react-router-dom";

const footerColumns = [
  {
    title: "KNOW SAHYADRI SURGICAL",
    links: [
      { to: "/about", label: "About Us" },
      { to: "/contact", label: "Contact Us" },
      { to: "/vendor-registration", label: "Vendor Registration" },
    ],
  },
  {
    title: "CUSTOMER SERVICE",
    links: [
      { to: "/service-policy", label: "Service policy" },
      { to: "/privacy-policy", label: "Privacy Policy" },
      { to: "/shipping-cancellation-policy", label: "Shipping, Delivery & Enquiry Policy" },
      { to: "/terms-conditions", label: "Terms & Conditions" },
    ],
  },
  {
    title: "VALUE ADDED SERVICES",
    links: [{ to: "/refer-and-earn", label: "Refer And Earn" }],
  },
];

const Footer = () => {
  return (
    <footer className="bg-white text-[#2f5f9d]">
      <div className="bg-[#315f9d] px-4 py-6 text-white sm:px-6 md:px-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h4 className="mb-4 break-words text-sm font-bold uppercase tracking-tight text-white md:text-base">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="break-words text-sm text-white/95 transition-colors hover:text-white md:text-base">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="bg-white py-2 text-center text-xs text-[#2f5f9d] md:text-sm">
        &copy; 2026 Sahyadri Surgical. All Rights Reserved. Designed by{" "}
        <a
          href="https://webakoof.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:underline"
        >
          Webakoof
        </a>
        .
      </div>
    </footer>
  );
};

export default Footer;
