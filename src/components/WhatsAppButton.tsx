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
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-8 w-8 fill-current"
      >
        <path d="M16.02 3.2A12.75 12.75 0 0 0 5.18 22.66L3.6 28.8l6.29-1.5a12.74 12.74 0 0 0 6.13 1.56h.01A12.83 12.83 0 0 0 28.8 16.04 12.8 12.8 0 0 0 16.02 3.2Zm0 23.5h-.01a10.6 10.6 0 0 1-5.41-1.48l-.39-.23-3.73.89.99-3.64-.26-.41a10.57 10.57 0 1 1 8.81 4.87Zm5.8-7.93c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.56-1.57-.95-.84-1.59-1.89-1.77-2.21-.18-.32-.02-.49.14-.65.14-.14.32-.37.47-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.72-.98-2.36-.26-.62-.52-.54-.71-.55h-.61c-.21 0-.55.08-.84.4-.29.32-1.11 1.08-1.11 2.64 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.15-1.51.26-.74.26-1.38.18-1.51-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
};

export default WhatsAppButton;
