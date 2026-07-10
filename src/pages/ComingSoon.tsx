import { Clock3, MessageCircle, Phone } from "lucide-react";
import logoImage from "@/assets/logo.png";
import { useContactSettings, useSiteSettings } from "@/hooks/useContent";

function stripDigits(value: string) {
  return value.replace(/\D/g, "");
}

const ComingSoon = () => {
  const { data: contactSettings } = useContactSettings();
  const { data: siteSettings } = useSiteSettings();
  const siteName = String(siteSettings.site_name || "Rent For Health");
  const callNumber = contactSettings?.phone || String(siteSettings.call_number || "+919876543210");
  const whatsappNumber = stripDigits(contactSettings?.whatsapp || String(siteSettings.whatsapp_number || "919876543210"));
  const whatsappMessage = encodeURIComponent(
    String(siteSettings.whatsapp_message || "Hi, I want to inquire about medical equipment")
  );

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[#edf4fc] px-4 py-4 text-[#17305d] sm:px-6 sm:py-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(95,138,214,0.18),_transparent_42%),radial-gradient(circle_at_bottom,_rgba(32,63,119,0.08),_transparent_45%)]" />
      <main className="relative mx-auto flex h-full max-w-5xl items-center justify-center">
        <section className="w-full max-w-3xl rounded-[28px] border border-white/70 bg-white/92 p-6 shadow-[0_30px_90px_rgba(44,90,161,0.16)] backdrop-blur sm:p-8 lg:p-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-28 items-center justify-center rounded-2xl bg-[#f5f8fe] px-3 shadow-sm">
              <img src={logoImage} alt={`${siteName} logo`} className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6b82a8]">Website Update</p>
              <h1 className="mt-1 text-xl font-bold text-[#17305d] sm:text-2xl">{siteName}</h1>
            </div>
          </div>

          <div className="mt-6 rounded-[26px] bg-[linear-gradient(135deg,#1f3f77_0%,#2c5aa1_100%)] p-6 text-white sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/95 sm:text-sm">
              <Clock3 className="h-4 w-4" />
              Coming Soon
            </div>

            <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              New website launching soon.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              We are working on a cleaner experience for Rent For Health. Direct inner-page links still work, but the main
              homepage is temporarily showing this banner.
            </p>

            <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/90">
              Need help right away? Contact our team below.
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a
                href={`tel:${callNumber}`}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#21457f] transition-colors hover:bg-[#eef4ff]"
              >
                <Phone className="h-4 w-4" />
                Call {callNumber.replace("+91", "").trim()}
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#1fae4b] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#189340]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Us
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ComingSoon;
