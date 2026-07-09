import { useEffect, useState } from "react";
import axisLogo from "@/assets/client-axis.svg";
import apolloLogo from "@/assets/client-apollo.svg";
import appleLogo from "@/assets/client-apple.svg";
import asthaLogo from "@/assets/client-astha.svg";
import diyaLogo from "@/assets/client-diya.svg";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useHomeContent, useTestimonials } from "@/hooks/useContent";

const fallbackClients = [
  { name: "Axis Orthopedic Hospital", logo: axisLogo },
  { name: "Apollo Hospitals", logo: apolloLogo },
  { name: "Apple Hospital", logo: appleLogo },
  { name: "Astha Hospital", logo: asthaLogo },
  { name: "Diya Hospitals", logo: diyaLogo },
];

const fallbackTestimonials = [
  {
    quote:
      "I am really impressed with the professional service offered by Quali5care. I was in need of a recliner wheelchair and got their number from Google. The wheelchair was delivered quickly and in excellent condition.",
    author: "Indrani Vaze",
  },
  {
    quote:
      "This is the second time I have ordered and I am very impressed by their service and the products provided on rent. Thanks to Ms. Reshma for coordinating and ensuring on-time delivery.",
    author: "Hiten Vachharajani",
  },
  {
    quote:
      "Great experience while using Quali5care. The equipment is affordable, delivery was on time, and the staff was polite and supportive throughout the process.",
    author: "Priya Jaiswal",
  },
  {
    quote:
      "I was looking for a walking stick for my mother-in-law and needed doorstep delivery in Pune. The team arranged it in a few hours and the service was smooth.",
    author: "Pranay Nanda",
  },
];

const clientLogoMap: Record<string, string> = {
  axis: axisLogo,
  apollo: apolloLogo,
  apple: appleLogo,
  astha: asthaLogo,
  diya: diyaLogo,
};

function isActiveItem(item: any) {
  const value = item?.is_active ?? item?.isActive;
  if (value === undefined || value === null) return true;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const normalized = String(value).toLowerCase().trim();
  return !["0", "false", "inactive", "off", "disabled"].includes(normalized);
}

function resolveClientLogo(value: any) {
  const rawLogo = String(value?.logoKey ?? value?.logo_key ?? value?.logo ?? value?.image ?? "").trim();
  if (!rawLogo) return "";
  return clientLogoMap[rawLogo] || rawLogo;
}

const ClientTestimonials = () => {
  const [clientsApi, setClientsApi] = useState<CarouselApi>();
  const [testimonialsApi, setTestimonialsApi] = useState<CarouselApi>();
  const [clientSlide, setClientSlide] = useState(0);
  const [testimonialSlide, setTestimonialSlide] = useState(0);
  const { data: homeContent } = useHomeContent();
  const { data: testimonialRows } = useTestimonials();

  const sourceClients = (homeContent?.clientLogos?.length ? homeContent.clientLogos : fallbackClients).filter(isActiveItem);
  const clients = (sourceClients.length ? sourceClients : fallbackClients).map((client: any) => ({
    name: String(client.name ?? client.client_name ?? "Client"),
    logo: resolveClientLogo(client) || String(client.logo || ""),
  }));

  const testimonials = (testimonialRows?.length ? testimonialRows : fallbackTestimonials).map((item: any) => ({
    quote: String(item.review_text ?? item.quote ?? ""),
    author: String(item.client_name ?? item.author ?? ""),
  }));

  useEffect(() => {
    if (!clientsApi) {
      return;
    }

    const onSelect = () => setClientSlide(clientsApi.selectedScrollSnap());
    onSelect();
    clientsApi.on("select", onSelect);
    clientsApi.on("reInit", onSelect);

    return () => {
      clientsApi.off("select", onSelect);
      clientsApi.off("reInit", onSelect);
    };
  }, [clientsApi]);

  useEffect(() => {
    if (!testimonialsApi) {
      return;
    }

    const onSelect = () => setTestimonialSlide(testimonialsApi.selectedScrollSnap());
    onSelect();
    testimonialsApi.on("select", onSelect);
    testimonialsApi.on("reInit", onSelect);

    return () => {
      testimonialsApi.off("select", onSelect);
      testimonialsApi.off("reInit", onSelect);
    };
  }, [testimonialsApi]);

  useEffect(() => {
    if (!clientsApi) {
      return;
    }

    const intervalId = window.setInterval(() => {
      clientsApi.scrollNext();
    }, 2800);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [clientsApi]);

  useEffect(() => {
    if (!testimonialsApi) {
      return;
    }

    const intervalId = window.setInterval(() => {
      testimonialsApi.scrollNext();
    }, 3800);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [testimonialsApi]);

  return (
    <>
      <section className="bg-white py-7 md:py-8">
        <div className="mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-lg font-semibold tracking-[0.2em] text-[#171a1f] md:text-xl">
            VALUED CLIENTS
          </h2>
          <p className="mt-1.5 text-center text-sm text-[#60656f] md:text-base">
            With top clients from all over India, we have served more than 500 clients in a timespan of 3 years.
          </p>

          <Carousel setApi={setClientsApi} opts={{ align: "start", loop: true }} className="mt-5 md:hidden">
            <CarouselContent className="-ml-2">
              {clients.map((client) => (
                <CarouselItem key={client.name} className="basis-[82%] pl-2">
                  <article className="flex h-[86px] items-center justify-center rounded-lg border border-[#e6e8ec] bg-white p-3 shadow-sm">
                    <img
                      src={client.logo}
                      alt={client.name}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div className="mt-3 flex justify-center gap-1.5 md:hidden">
            {clients.map((client, index) => (
              <button
                key={client.name}
                type="button"
                aria-label={`Go to client ${index + 1}`}
                onClick={() => clientsApi?.scrollTo(index)}
                className={`h-1.5 rounded-full transition-all ${clientSlide === index ? "w-4 bg-[#315da6]" : "w-1.5 bg-[#c8cfdd]"}`}
              />
            ))}
          </div>

          <div className="mt-5 hidden grid-cols-2 gap-3 md:grid lg:grid-cols-5">
            {clients.map((client) => (
              <article
                key={client.name}
                className="flex h-[86px] items-center justify-center rounded-lg border border-[#e6e8ec] bg-white p-3 shadow-sm"
              >
                <img
                  src={client.logo}
                  alt={client.name}
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#edf0f3] py-7 md:py-8">
        <div className="mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-lg font-semibold tracking-[0.2em] text-[#171a1f] md:text-xl">
            TESTIMONIALS
          </h2>

          <Carousel setApi={setTestimonialsApi} opts={{ align: "start", loop: true }} className="mt-5 md:hidden">
            <CarouselContent className="-ml-2">
              {testimonials.map((item) => (
                <CarouselItem key={item.author} className="basis-[94%] pl-2">
                  <article className="rounded-lg border border-[#d5d9de] bg-white p-3.5 shadow-sm">
                    <p className="mb-1.5 text-lg font-bold leading-none text-[#1f2329]">"</p>
                    <p className="min-h-[98px] text-sm leading-relaxed text-[#5f6570]">{item.quote}</p>
                    <p className="mt-2 text-sm font-semibold text-[#3f4450]">- {item.author}</p>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div className="mt-3 flex justify-center gap-1.5 md:hidden">
            {testimonials.map((item, index) => (
              <button
                key={item.author}
                type="button"
                aria-label={`Go to testimonial ${index + 1}`}
                onClick={() => testimonialsApi?.scrollTo(index)}
                className={`h-1.5 rounded-full transition-all ${testimonialSlide === index ? "w-4 bg-[#315da6]" : "w-1.5 bg-[#c8cfdd]"}`}
              />
            ))}
          </div>

          <div className="mt-5 hidden grid-cols-2 gap-3 md:grid xl:grid-cols-4">
            {testimonials.map((item) => (
              <article
                key={item.author}
                className="rounded-lg border border-[#d5d9de] bg-white p-3.5 shadow-sm"
              >
                <p className="mb-1.5 text-lg font-bold leading-none text-[#1f2329]">"</p>
                <p className="min-h-[98px] text-sm leading-relaxed text-[#5f6570]">{item.quote}</p>
                <p className="mt-2 text-sm font-semibold text-[#3f4450]">- {item.author}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-7 md:py-8">
        <div className="mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-8">
          <h2 className="text-base font-bold uppercase tracking-[0.08em] text-[#111827] md:text-lg">
            What Is Rent For Health?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#5b6572] md:text-[15px]">
            Sahyadri Surgicals helps families access hospital-grade medical equipment at home without heavy purchase costs.
            Many patients need equipment for short-term recovery, and buying every device is not practical. Our rent-for-health
            model makes care affordable with sanitized, certified equipment, quick delivery, and support for setup and usage.
            We serve home-care, post-surgery, elderly care, and critical-care needs with transparent pricing and dependable service.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <article className="rounded-lg border border-[#e4e7ec] bg-[#f8fafc] p-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[#111827]">Our Vision</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5b6572]">
                Quality medical care and equipment support made patient-centric, accessible, and affordable at the doorstep.
              </p>
            </article>
            <article className="rounded-lg border border-[#e4e7ec] bg-[#f8fafc] p-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[#111827]">Our Mission</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5b6572]">
                To deliver trusted equipment and responsive service through a robust healthcare rental model that improves
                recovery outcomes at home.
              </p>
            </article>
          </div>

          <article className="mt-5 rounded-lg border border-[#d9e2ef] bg-[#f4f8ff] p-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[#111827]">Get In Touch</h3>
            <p className="mt-2 break-words text-sm leading-relaxed text-[#4f5b6b]">
              Phone: <a href="tel:+919876543210" className="font-semibold text-[#2f5ca6]">+91 98765 43210</a> |
              {" "}WhatsApp: <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="font-semibold text-[#2f5ca6]">+91 98765 43210</a> |
              {" "}Email: <a href="mailto:info@sahyadrisurgicals.com" className="font-semibold text-[#2f5ca6]">info@sahyadrisurgicals.com</a> |
              {" "}Address: Pune, Maharashtra, India
            </p>
          </article>
        </div>
      </section>
    </>
  );
};

export default ClientTestimonials;
