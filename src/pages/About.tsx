import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";
import { Button } from "@/components/ui/button";
import {
  Accessibility,
  BedDouble,
  CheckCircle,
  HeartPulse,
  Home,
  IndianRupee,
  Phone,
  ShieldCheck,
  Stethoscope,
  Truck,
  Users,
} from "lucide-react";

const trustStats = [
  { value: "24/7", label: "Support for urgent needs" },
  { value: "Rent + Buy", label: "Flexible equipment options" },
  { value: "Pune", label: "Local home-care support" },
];

const services = [
  {
    icon: BedDouble,
    title: "Hospital Beds",
    text: "Manual, semi-fowler, and electric beds for comfortable home recovery.",
  },
  {
    icon: Accessibility,
    title: "Mobility Support",
    text: "Wheelchairs, walkers, crutches, commode chairs, and elderly-care aids.",
  },
  {
    icon: HeartPulse,
    title: "Respiratory & ICU Devices",
    text: "Oxygen concentrators, cylinders, monitors, BiPAP/CPAP, and ICU support.",
  },
  {
    icon: Home,
    title: "Home Healthcare Setup",
    text: "Doorstep delivery, setup coordination, and guidance for patient-care spaces.",
  },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Sanitized Equipment",
    text: "Products are checked, cleaned, and prepared before dispatch for home use.",
  },
  {
    icon: IndianRupee,
    title: "Affordable Access",
    text: "Rental and purchase options help families choose what fits treatment duration and budget.",
  },
  {
    icon: Truck,
    title: "Doorstep Coordination",
    text: "Our team coordinates delivery and support so families can focus on recovery.",
  },
  {
    icon: Users,
    title: "Caregiver Friendly",
    text: "We help families understand the right equipment for post-surgery, elderly, and critical-care needs.",
  },
];

const process = [
  "Share the patient requirement",
  "Get product guidance and pricing",
  "Confirm rent or purchase option",
  "Receive delivery and setup support",
];

const About = () => {
  return (
    <div className="min-h-screen bg-[#f7f8fb] pb-16 md:pb-0">
      <Header />

      <section className="bg-[#315f9d] text-white">
        <div className="section-container py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-white/70">About Sahyadri Surgical</p>
              <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight md:text-5xl">
                Hospital-grade medical equipment made easier for home care.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/85">
                Sahyadri Surgical helps families rent or buy reliable medical equipment for recovery, elderly care,
                mobility support, respiratory care, and ICU-at-home needs.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild className="bg-white text-[#315f9d] hover:bg-white/90">
                  <Link to="/products">Explore Products</Link>
                </Button>
                <Button asChild variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                  <Link to="/contact">Contact Team</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-white/15 bg-white/10 p-5">
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {trustStats.map((item) => (
                  <div key={item.value} className="rounded-lg bg-white p-5 text-[#1f2937]">
                    <p className="font-display text-2xl font-extrabold text-[#315f9d]">{item.value}</p>
                    <p className="mt-1 text-sm text-[#667085]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-14">
        <div className="section-container">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="rounded-lg border border-[#d9dde5] bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#e9eff8]">
                <Stethoscope className="h-6 w-6 text-[#315f9d]" />
              </div>
              <h2 className="font-display text-2xl font-bold text-[#111827]">What We Do</h2>
              <p className="mt-4 text-sm leading-7 text-[#5f6673]">
                We bridge the gap between hospital discharge and safe home recovery by helping families access the
                equipment they need without unnecessary delay or heavy upfront purchase pressure.
              </p>
              <p className="mt-4 text-sm leading-7 text-[#5f6673]">
                From short-term rentals to long-term purchase requirements, our focus is practical support, transparent
                communication, and dependable equipment availability.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <article key={service.title} className="rounded-lg border border-[#d9dde5] bg-white p-5 shadow-sm">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#e9eff8]">
                    <service.icon className="h-5 w-5 text-[#315f9d]" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#315f9d]">{service.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#667085]">{service.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-14">
        <div className="section-container">
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl font-bold text-[#111827] md:text-3xl">Why Families Choose Us</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-[#667085]">
              Our work is built around timely equipment access, safe handling, and clear support for caregivers.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <article key={value.title} className="rounded-lg border border-[#d9dde5] bg-[#f7f8fb] p-5">
                <value.icon className="h-7 w-7 text-[#315f9d]" />
                <h3 className="mt-4 font-display text-lg font-bold text-[#111827]">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#667085]">{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-14">
        <div className="section-container">
          <div className="grid gap-6 rounded-lg border border-[#d9dde5] bg-white p-6 shadow-sm md:p-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#315f9d]">Simple Process</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-[#111827]">From enquiry to setup, kept clear.</h2>
              <p className="mt-4 text-sm leading-7 text-[#667085]">
                Tell us what the patient needs. Our team helps identify suitable equipment and coordinates the next
                steps for rent or purchase.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {process.map((step, index) => (
                <div key={step} className="flex gap-3 rounded-lg bg-[#f7f8fb] p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#315f9d] text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#315f9d]" />
                    <p className="text-sm font-semibold text-[#344054]">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#315f9d] py-10 text-white">
        <div className="section-container">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Need equipment guidance?</h2>
              <p className="mt-2 text-sm text-white/80">
                Speak with Sahyadri Surgical for rent, purchase, or home-care equipment support.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-white text-[#315f9d] hover:bg-white/90">
                <a href="tel:+919876543210">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now
                </a>
              </Button>
              <Button asChild variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                <Link to="/products">View Equipment</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </div>
  );
};

export default About;
