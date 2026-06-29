import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";
import { Clock, Mail, MapPin, MessageCircle, Phone, Wrench } from "lucide-react";

const phoneNumber = "+919876543210";
const displayPhone = "98765 43210";
const whatsappUrl = "https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20inquire%20about%20medical%20equipment";
const email = "info@sahyadrisurgicals.com";

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#f7f8fb] pb-16 md:pb-0">
      <Header />

      <section className="bg-[#315f9d] py-10 text-center text-white md:py-12">
        <div className="section-container">
          <h1 className="font-display text-2xl font-bold md:text-3xl">Get in Touch</h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-white/90">
            Connect with us for any queries related to our products or services using any of the ways below.
          </p>
        </div>
      </section>

      <main className="py-10 md:py-12">
        <div className="section-container">
          <section className="mx-auto max-w-6xl">
            <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
              <aside className="overflow-hidden rounded-lg bg-[#315f9d] text-white shadow-lg shadow-[#315f9d]/20">
                <div className="p-6 md:p-8">
                  <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Sahyadri Surgical</p>
                  <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight sm:text-3xl">Medical Equipment Support Desk</h2>
                  <p className="mt-4 text-sm leading-7 text-white/85">
                    Contact us for hospital beds, wheelchairs, oxygen equipment, patient care products, and home
                    healthcare equipment support.
                  </p>
                </div>

                <div className="grid border-y border-white/15 sm:grid-cols-3 lg:grid-cols-1">
                  {[
                    {
                      icon: Phone,
                      label: "Call",
                      value: displayPhone,
                      href: `tel:${phoneNumber}`,
                    },
                    {
                      icon: MessageCircle,
                      label: "WhatsApp",
                      value: displayPhone,
                      href: whatsappUrl,
                    },
                    {
                      icon: Mail,
                      label: "Email",
                      value: email,
                      href: `mailto:${email}`,
                    },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="flex min-w-0 items-center gap-4 border-white/15 p-5 transition-colors hover:bg-white/10 sm:border-r lg:border-b lg:border-r-0"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/15">
                        <item.icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold uppercase tracking-wide text-white/65">{item.label}</span>
                        <span className="mt-1 block break-words text-sm font-bold">{item.value}</span>
                      </span>
                    </a>
                  ))}
                </div>

                <div className="p-6 md:p-8">
                  <div className="rounded-lg bg-white/10 p-5">
                    <div className="flex items-start gap-4">
                      <Clock className="mt-1 h-5 w-5 shrink-0 text-white/85" />
                      <div>
                        <h3 className="font-display text-lg font-bold">Business Hours</h3>
                        <p className="mt-1 text-sm text-white/85">Monday - Sunday</p>
                        <p className="text-sm text-white/85">8:30 am to 9:00 pm</p>
                      </div>
                    </div>
                  </div>
                  <a
                    href={`mailto:${email}`}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-bold text-[#315f9d] transition-opacity hover:opacity-90 sm:w-auto"
                  >
                    <Wrench className="h-4 w-4" />
                    Escalate an Issue
                  </a>
                </div>
              </aside>

              <div className="grid gap-6">
                <section className="rounded-lg border border-[#d9dde5] bg-white p-6 shadow-sm md:p-8">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e9eff8]">
                      <MapPin className="h-6 w-6 text-[#315f9d]" />
                    </span>
                    <h2 className="font-display text-2xl font-bold text-[#111827]">Office Address</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-[#f7f8fb] p-5">
                      <p className="text-sm font-semibold uppercase tracking-wide text-[#315f9d]">Location</p>
                      <p className="mt-2 text-lg font-semibold text-[#333]">Sahyadri Surgical</p>
                      <p className="mt-1 text-sm leading-relaxed text-[#666]">Pune, Maharashtra, India</p>
                    </div>
                    <div className="rounded-lg bg-[#f7f8fb] p-5">
                      <p className="text-sm font-semibold uppercase tracking-wide text-[#315f9d]">Services</p>
                      <p className="mt-2 text-sm leading-7 text-[#666]">
                        Medical equipment rental and purchase support for home healthcare needs.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="overflow-hidden rounded-lg border border-[#d9dde5] bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-[#d9dde5] px-4 py-4 sm:px-6">
                    <div>
                      <h2 className="font-display text-xl font-bold text-[#111827]">Find Us on Map</h2>
                      <p className="mt-1 text-sm text-[#666]">Pune, Maharashtra</p>
                    </div>
                    <MapPin className="h-6 w-6 text-[#315f9d]" />
                  </div>
                  <div className="h-[360px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d242117.68070802!2d73.72288!3d18.524598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf2e67461101%3A0x828d43bf9d9ee343!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Sahyadri Surgical Location"
                  />
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </div>
  );
};

export default Contact;
