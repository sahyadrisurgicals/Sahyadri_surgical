import { useState, type FormEvent } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitVendor } from "@/lib/api";
import {
  CheckCircle,
  Database,
  ExternalLink,
  FileText,
  Gift,
  HandCoins,
  HeartHandshake,
  Lock,
  MessageSquareText,
  Settings,
  PackageCheck,
  Scale,
  RefreshCw,
  Send,
  Share2,
  ShieldCheck,
  Truck,
  UserCheck,
  Users,
} from "lucide-react";

type InfoPageProps = {
  title: string;
  subtitle: string;
  sections: {
    heading: string;
    text: string;
  }[];
};

const InfoPage = ({ title, subtitle, sections }: InfoPageProps) => (
  <div className="min-h-screen bg-background pb-16 md:pb-0">
    <Header />
    <section className="bg-[#315f9d] py-14">
      <div className="section-container">
        <h1 className="font-display text-3xl font-extrabold text-white md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-white/85">{subtitle}</p>
      </div>
    </section>
    <main className="py-12">
      <div className="section-container">
        <div className="mx-auto max-w-4xl space-y-6">
          {sections.map((section) => (
            <section key={section.heading} className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-3 font-display text-xl font-bold text-foreground">{section.heading}</h2>
              <p className="leading-relaxed text-muted-foreground">{section.text}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
    <Footer />
    <WhatsAppButton />
    <MobileBottomBar />
  </div>
);

const Field = ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <Label className="mb-1.5 block text-sm font-semibold text-[#4f4f4f]">{label}</Label>
    {children}
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="border-b border-[#d9dde5] bg-[#f7f8fb] px-4 py-3">
    <h2 className="font-display text-base font-bold text-[#305c9d]">{children}</h2>
  </div>
);

export const VendorRegistration = () => {
  const [form, setForm] = useState({
    businessName: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
    gstin: "",
    pan: "",
    vendorTag: "",
    productCategory: "",
    address1: "",
    address2: "",
    state: "",
    city: "",
    pincode: "",
    warehouse: "",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifsc: "",
    remarks: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setForm({
      businessName: "",
      contactPerson: "",
      contactNumber: "",
      email: "",
      gstin: "",
      pan: "",
      vendorTag: "",
      productCategory: "",
      address1: "",
      address2: "",
      state: "",
      city: "",
      pincode: "",
      warehouse: "",
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      ifsc: "",
      remarks: "",
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.businessName.trim() || !form.contactPerson.trim() || !form.contactNumber.trim()) {
      toast.error("Please fill in the required vendor details");
      return;
    }

    setSubmitting(true);
    try {
      const address = [form.address1, form.address2, form.city, form.state, form.pincode, form.warehouse]
        .map((item) => item.trim())
        .filter(Boolean)
        .join(", ");
      const notes = [
        form.vendorTag ? `Vendor Tag: ${form.vendorTag}` : "",
        form.pan ? `PAN: ${form.pan}` : "",
        form.bankName ? `Bank: ${form.bankName}` : "",
        form.accountHolderName ? `Account Holder: ${form.accountHolderName}` : "",
        form.accountNumber ? `Account Number: ${form.accountNumber}` : "",
        form.ifsc ? `IFSC: ${form.ifsc}` : "",
        form.remarks ? `Notes: ${form.remarks}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      await submitVendor({
        vendor_name: form.contactPerson.trim(),
        business_name: form.businessName.trim(),
        phone: form.contactNumber.trim(),
        email: form.email.trim(),
        address,
        category: form.productCategory.trim(),
        gst_number: form.gstin.trim(),
        admin_notes: notes,
      });
      toast.success("Vendor registration submitted");
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit vendor registration");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eff1f4] pb-16 md:pb-0">
      <Header />
      <section className="bg-[#305c9d] py-7 text-center shadow-sm">
        <div className="section-container">
          <h1 className="font-display text-2xl font-bold text-white md:text-3xl">Vendor Registration</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
            Register your business with us for medical equipment supply, product servicing, and healthcare support.
          </p>
        </div>
      </section>
      <main className="py-8 md:py-10">
        <div className="section-container">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-sm border border-[#d9dde5] bg-white shadow-sm">
            <div className="bg-[#f7f8fb] px-5 py-4 text-center">
              <h2 className="font-display text-xl font-bold text-[#305c9d]">Become a Vendor</h2>
              <p className="mx-auto mt-1 max-w-3xl text-sm text-[#666]">
                Fill in your company, address, account, and document details. Our team will review the information and
                contact you for the next onboarding step.
              </p>
            </div>
            <form className="divide-y divide-[#d9dde5]" onSubmit={handleSubmit}>
              <section>
                <SectionTitle>Vendor Information</SectionTitle>
                <div className="grid gap-4 p-5 md:grid-cols-2">
                  <Field label="Business Name *">
                    <Input
                      className="h-10 rounded-sm border-[#cfd4dc]"
                      value={form.businessName}
                      onChange={(event) => setForm((prev) => ({ ...prev, businessName: event.target.value }))}
                    />
                  </Field>
                  <Field label="Contact Person *">
                    <Input
                      className="h-10 rounded-sm border-[#cfd4dc]"
                      value={form.contactPerson}
                      onChange={(event) => setForm((prev) => ({ ...prev, contactPerson: event.target.value }))}
                    />
                  </Field>
                  <Field label="Contact Number *">
                    <Input
                      className="h-10 rounded-sm border-[#cfd4dc]"
                      type="tel"
                      value={form.contactNumber}
                      onChange={(event) => setForm((prev) => ({ ...prev, contactNumber: event.target.value }))}
                    />
                  </Field>
                  <Field label="Email Address">
                    <Input
                      className="h-10 rounded-sm border-[#cfd4dc]"
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    />
                  </Field>
                  <Field label="GSTIN No. *">
                    <Input
                      className="h-10 rounded-sm border-[#cfd4dc]"
                      value={form.gstin}
                      onChange={(event) => setForm((prev) => ({ ...prev, gstin: event.target.value }))}
                    />
                  </Field>
                  <Field label="PAN No.">
                    <Input
                      className="h-10 rounded-sm border-[#cfd4dc]"
                      value={form.pan}
                      onChange={(event) => setForm((prev) => ({ ...prev, pan: event.target.value }))}
                    />
                  </Field>
                  <Field label="Vendor Tag">
                    <Input
                      className="h-10 rounded-sm border-[#cfd4dc]"
                      placeholder="Manufacturer / Dealer / Service Partner"
                      value={form.vendorTag}
                      onChange={(event) => setForm((prev) => ({ ...prev, vendorTag: event.target.value }))}
                    />
                  </Field>
                  <Field label="Product Category">
                    <Select value={form.productCategory} onValueChange={(value) => setForm((prev) => ({ ...prev, productCategory: value }))}>
                      <SelectTrigger className="h-10 rounded-sm border-[#cfd4dc]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medical-equipment">Medical Equipment</SelectItem>
                        <SelectItem value="mobility-aids">Mobility Aids</SelectItem>
                        <SelectItem value="respiratory">Respiratory Support</SelectItem>
                        <SelectItem value="service">Service & Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </section>

              <section>
                <SectionTitle>Registered Address</SectionTitle>
                <div className="grid gap-4 p-5 md:grid-cols-2">
                  <Field label="Address Line 1 *" className="md:col-span-2">
                    <Input
                      className="h-10 rounded-sm border-[#cfd4dc]"
                      value={form.address1}
                      onChange={(event) => setForm((prev) => ({ ...prev, address1: event.target.value }))}
                    />
                  </Field>
                  <Field label="Address Line 2" className="md:col-span-2">
                    <Input
                      className="h-10 rounded-sm border-[#cfd4dc]"
                      value={form.address2}
                      onChange={(event) => setForm((prev) => ({ ...prev, address2: event.target.value }))}
                    />
                  </Field>
                  <Field label="State *">
                    <Select value={form.state} onValueChange={(value) => setForm((prev) => ({ ...prev, state: value }))}>
                      <SelectTrigger className="h-10 rounded-sm border-[#cfd4dc]">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                        <SelectItem value="gujarat">Gujarat</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="City *">
                    <Select value={form.city} onValueChange={(value) => setForm((prev) => ({ ...prev, city: value }))}>
                      <SelectTrigger className="h-10 rounded-sm border-[#cfd4dc]">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="pune">Pune</SelectItem>
                        <SelectItem value="thane">Thane</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Pincode *">
                    <Input
                      className="h-10 rounded-sm border-[#cfd4dc]"
                      value={form.pincode}
                      onChange={(event) => setForm((prev) => ({ ...prev, pincode: event.target.value }))}
                    />
                  </Field>
                  <Field label="Warehouse / Service Area">
                    <Input
                      className="h-10 rounded-sm border-[#cfd4dc]"
                      value={form.warehouse}
                      onChange={(event) => setForm((prev) => ({ ...prev, warehouse: event.target.value }))}
                    />
                  </Field>
                </div>
              </section>

              <section>
                <SectionTitle>Account Information</SectionTitle>
                <div className="grid gap-4 p-5 md:grid-cols-2">
                  <Field label="Bank Name">
                    <Input
                      className="h-10 rounded-sm border-[#cfd4dc]"
                      value={form.bankName}
                      onChange={(event) => setForm((prev) => ({ ...prev, bankName: event.target.value }))}
                    />
                  </Field>
                  <Field label="Account Holder Name">
                    <Input
                      className="h-10 rounded-sm border-[#cfd4dc]"
                      value={form.accountHolderName}
                      onChange={(event) => setForm((prev) => ({ ...prev, accountHolderName: event.target.value }))}
                    />
                  </Field>
                  <Field label="Account Number">
                    <Input
                      className="h-10 rounded-sm border-[#cfd4dc]"
                      value={form.accountNumber}
                      onChange={(event) => setForm((prev) => ({ ...prev, accountNumber: event.target.value }))}
                    />
                  </Field>
                  <Field label="IFSC Code">
                    <Input
                      className="h-10 rounded-sm border-[#cfd4dc]"
                      value={form.ifsc}
                      onChange={(event) => setForm((prev) => ({ ...prev, ifsc: event.target.value }))}
                    />
                  </Field>
                </div>
              </section>

              <section>
                <SectionTitle>Documents & Notes</SectionTitle>
                <div className="grid gap-5 p-5 md:grid-cols-[1fr_1.2fr]">
                  <div>
                    <Label className="mb-3 block text-sm font-semibold text-[#4f4f4f]">Available Documents</Label>
                    <div className="space-y-3 rounded-sm border border-[#d9dde5] bg-[#fafafa] p-4">
                      {["Vendor Agreement", "Shop Est. Cert.", "Aadhar Card", "GST Certificate"].map((document) => (
                        <label key={document} className="flex items-center gap-3 text-sm text-[#555]">
                          <Checkbox className="border-[#305c9d] data-[state=checked]:bg-[#305c9d]" />
                          <span>{document}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Field label="Remarks / Product Details">
                    <Textarea
                      className="min-h-[130px] rounded-sm border-[#cfd4dc]"
                      value={form.remarks}
                      onChange={(event) => setForm((prev) => ({ ...prev, remarks: event.target.value }))}
                    />
                  </Field>
                </div>
              </section>

              <div className="flex flex-col-reverse gap-3 bg-[#f7f8fb] px-5 py-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-sm border-[#cfd4dc] text-[#555]"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-sm bg-[#305c9d] px-8 text-white hover:bg-[#264d86]" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </div>
  );
};

export const ServicePolicy = () => (
  <div className="min-h-screen bg-[#eff1f4] pb-16 md:pb-0">
    <Header />
    <section className="bg-[#305c9d] py-12 text-center">
      <div className="section-container">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
          <Settings className="h-8 w-8 text-white" />
        </div>
        <h1 className="font-display text-3xl font-extrabold text-white md:text-4xl">Service Policy</h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-white/85 md:text-base">
          Clear service terms for equipment care, maintenance support, order changes, safe usage, and dispute handling.
        </p>
      </div>
    </section>

    <main className="py-10">
      <div className="section-container">
        <div className="mx-auto grid max-w-5xl gap-6">
          {[
            {
              icon: ShieldCheck,
              title: "Damage Policy",
              paragraphs: [
                "Customers are responsible for maintaining the products and equipment supplied by Sahyadri Surgical in proper condition during their possession or usage period. Any loss, theft, misuse, accidental damage, or destruction of the equipment may result in repair or replacement charges based on the extent of damage and the prevailing market value of the product.",
                "Upon return or collection of the equipment, our authorized representatives may inspect the items to determine their condition and assess any applicable charges.",
              ],
            },
            {
              icon: Settings,
              title: "Maintenance Policy",
              paragraphs: [
                "Sahyadri Surgical will provide maintenance and technical support for eligible products and equipment during the agreed service or rental period, subject to the terms of the contract.",
                "This coverage does not include damages resulting from negligence, improper handling, unauthorized repairs, misuse, electrical faults caused externally, or operation contrary to the manufacturer's instructions.",
                "Customers should report technical issues to our support team promptly. We will make reasonable efforts to resolve reported problems within the committed service timelines. If delays occur due to circumstances beyond our control, customers will be informed accordingly.",
              ],
            },
            {
              icon: Scale,
              title: "General Terms",
              paragraphs: [
                "Orders may be modified or cancelled before dispatch or delivery confirmation without additional charges. Once the order has been processed or dispatched, applicable transportation, handling, or cancellation charges may apply.",
                "Customers assume responsibility for the proper use of all products and equipment supplied by Sahyadri Surgical. The company shall not be held liable for any direct or indirect losses, injuries, damages, or claims arising from incorrect usage, negligence, or operation of the products outside their intended purpose.",
                "Any disputes arising from the use of our products or services shall be subject to the jurisdiction of the competent courts in Maharashtra, India.",
                "Sahyadri Surgical reserves the right to refuse, suspend, or discontinue service where deemed necessary due to policy violations, safety concerns, payment issues, or other legitimate business reasons.",
              ],
            },
          ].map((section) => (
            <section key={section.title} className="overflow-hidden rounded-lg border border-[#d9dde5] bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-[#d9dde5] bg-[#f7f8fb] px-6 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e9eff8]">
                  <section.icon className="h-5 w-5 text-[#305c9d]" />
                </div>
                <h2 className="font-display text-xl font-bold text-[#305c9d]">{section.title}</h2>
              </div>
              <div className="space-y-4 p-6">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-[#5f6673] md:text-base">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>

    <Footer />
    <WhatsAppButton />
    <MobileBottomBar />
  </div>
);

export const PrivacyPolicy = () => (
  <div className="min-h-screen bg-[#eff1f4] pb-16 md:pb-0">
    <Header />
    <section className="bg-[#305c9d] py-12 text-center">
      <div className="section-container">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
          <ShieldCheck className="h-8 w-8 text-white" />
        </div>
        <h1 className="font-display text-3xl font-extrabold text-white md:text-4xl">Privacy Policy</h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-white/85 md:text-base">
          Sahyadri Surgical respects your privacy and is committed to protecting the information shared with us
          through our website, forms, orders, and customer support interactions.
        </p>
      </div>
    </section>

    <main className="py-10">
      <div className="section-container">
        <div className="mx-auto grid max-w-6xl gap-6">
          <section className="rounded-lg border border-[#d9dde5] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#e9eff8]">
                <Database className="h-6 w-6 text-[#305c9d]" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-[#305c9d]">Information We May Collect</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#666]">
                  To provide better products and services, Sahyadri Surgical may collect certain information from users,
                  including but not limited to:
                </p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {[
                    "Full name and contact details.",
                    "Business or company information where applicable.",
                    "Delivery and billing addresses.",
                    "Email address and communication preferences.",
                    "Payment and transaction-related information.",
                    "Details related to products purchased or inquiries submitted.",
                    "Device information such as browser type, IP address, and website usage data.",
                    "Additional information voluntarily shared through forms, registrations, or support interactions.",
                  ].map((item) => (
                    <div key={item} className="flex gap-3 rounded-md bg-[#f7f8fb] p-3">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#305c9d]" />
                      <p className="text-sm leading-relaxed text-[#555]">{item}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 rounded-md border-l-4 border-[#305c9d] bg-[#f7f8fb] p-4 text-sm leading-relaxed text-[#555]">
                  Providing personal information is completely voluntary; however, some services may not be available if
                  certain information is not provided.
                </p>
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {[
              {
                icon: UserCheck,
                title: "How We Use Your Information",
                intro: "The information collected may be used for purposes such as:",
                points: [
                  "Processing and fulfilling orders.",
                  "Providing customer support and responding to inquiries.",
                  "Sending updates related to orders, deliveries, and services.",
                  "Improving website functionality and user experience.",
                  "Maintaining internal business records.",
                  "Complying with legal and regulatory requirements.",
                  "Informing customers about new products, offers, or important service announcements where permitted.",
                ],
              },
              {
                icon: Lock,
                title: "Data Protection and Security",
                intro:
                  "Sahyadri Surgical implements appropriate technical and organizational security measures to safeguard your personal information from unauthorized access, misuse, disclosure, alteration, or loss.",
                points: [
                  "We work to maintain strong security standards.",
                  "No method of internet transmission or electronic storage can guarantee absolute security.",
                ],
              },
              {
                icon: Share2,
                title: "Sharing of Information",
                intro: "We respect your privacy and do not sell, rent, or trade your personal information to third parties.",
                points: [
                  "Trusted logistics and delivery partners for order fulfillment.",
                  "Payment processing providers for transaction completion.",
                  "Service providers assisting with website operations or customer support.",
                  "Government authorities or regulatory bodies where disclosure is required by law.",
                  "All such third parties are expected to maintain the confidentiality and security of your information.",
                ],
              },
              {
                icon: ExternalLink,
                title: "Third-Party Websites",
                intro:
                  "Our website may contain links to external websites or services for your convenience. Sahyadri Surgical is not responsible for the privacy practices, policies, or content of third-party websites.",
                points: ["Users are encouraged to review those privacy policies before sharing any information."],
              },
              {
                icon: RefreshCw,
                title: "Updates to This Privacy Policy",
                intro:
                  "We reserve the right to modify or update this Privacy Policy at any time to reflect changes in our services, legal requirements, or business practices.",
                points: ["Updated versions will be published on this page along with the effective date of revision."],
              },
              {
                icon: ShieldCheck,
                title: "Your Consent",
                intro:
                  "By accessing or using the Sahyadri Surgical website, you acknowledge that you have read, understood, and agreed to the terms outlined in this Privacy Policy.",
                points: [],
              },
            ].map((section) => (
              <section key={section.title} className="rounded-lg border border-[#d9dde5] bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e9eff8]">
                    <section.icon className="h-5 w-5 text-[#305c9d]" />
                  </div>
                  <h2 className="font-display text-lg font-bold text-[#305c9d]">{section.title}</h2>
                </div>
                <p className="text-sm leading-relaxed text-[#666]">{section.intro}</p>
                {section.points.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {section.points.map((point) => (
                      <li key={point} className="flex gap-2 text-sm leading-relaxed text-[#555]">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#305c9d]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>

    <Footer />
    <WhatsAppButton />
    <MobileBottomBar />
  </div>
);

export const ShippingCancellationPolicy = () => (
  <div className="min-h-screen bg-[#eff1f4] pb-16 md:pb-0">
    <Header />
    <section className="bg-[#305c9d] py-12 text-center">
      <div className="section-container">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
          <Truck className="h-8 w-8 text-white" />
        </div>
        <h1 className="font-display text-3xl font-extrabold text-white md:text-4xl">
          Shipping, Delivery & Enquiry Policy
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-white/85 md:text-base">
          Information about enquiries, availability, delivery timelines, inspection, cancellations, access requirements,
          and assistance for Sahyadri Surgical products.
        </p>
      </div>
    </section>

    <main className="py-10">
      <div className="section-container">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {[
            {
              icon: MessageSquareText,
              title: "Product Enquiry Policy",
              paragraphs: [
                "Sahyadri Surgical primarily operates on an enquiry and quotation basis. Submission of an enquiry through our website does not constitute an order confirmation or purchase agreement.",
                "Our team will review your enquiry and contact you with product details, availability, pricing, and delivery timelines wherever applicable.",
              ],
            },
            {
              icon: PackageCheck,
              title: "Product Availability",
              paragraphs: [
                "Product availability displayed on the website is subject to stock status and supplier availability at the time of enquiry processing. Certain products may require additional procurement time depending on manufacturer or distributor schedules.",
              ],
            },
            {
              icon: Truck,
              title: "Delivery Information",
              paragraphs: [
                "For confirmed orders processed offline or through direct communication, estimated delivery timelines will be shared separately with the customer.",
                "Sahyadri Surgical shall not be responsible for delays caused by circumstances beyond reasonable control.",
              ],
              points: [
                "Product availability",
                "Delivery location",
                "Transportation conditions",
                "Manufacturer lead times",
                "Regulatory or logistical constraints",
              ],
            },
            {
              icon: CheckCircle,
              title: "Inspection Upon Delivery",
              paragraphs: [
                "Customers are requested to inspect products at the time of delivery and notify us immediately of any visible damage, shortages, or discrepancies.",
                "Any issues identified after delivery should be reported within the specified reporting period to enable prompt resolution.",
              ],
            },
            {
              icon: RefreshCw,
              title: "Changes and Cancellation of Enquiries",
              paragraphs: [
                "Customers may modify or withdraw an enquiry request at any time before quotation approval or order confirmation without any charges.",
                "If an order has already been confirmed and procurement or dispatch activities have commenced, cancellation requests may be subject to applicable processing or restocking charges depending on supplier policies.",
              ],
            },
            {
              icon: ShieldCheck,
              title: "Delivery Access Requirements",
              paragraphs: [
                "Customers are responsible for ensuring proper access for delivery personnel at the delivery location, including entry permissions, unloading arrangements, and site accessibility where necessary.",
                "Any additional handling or transportation requirements may result in extra charges if applicable.",
              ],
            },
            {
              icon: Scale,
              title: "Limitation of Responsibility",
              paragraphs: [
                "Sahyadri Surgical provides product information and quotations based on the details supplied by customers. Final product suitability and application should be verified by qualified medical professionals or procurement teams before use.",
                "The company shall not be held responsible for losses or damages arising from incorrect product selection, improper handling, or usage outside the intended purpose.",
              ],
            },
            {
              icon: UserCheck,
              title: "Contact for Assistance",
              paragraphs: [
                "For enquiries regarding product availability, quotations, delivery schedules, or support, customers may contact the Sahyadri Surgical team through the contact information provided on our website.",
              ],
            },
          ].map((section) => (
            <section key={section.title} className="rounded-lg border border-[#d9dde5] bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e9eff8]">
                  <section.icon className="h-5 w-5 text-[#305c9d]" />
                </div>
                <h2 className="font-display text-lg font-bold text-[#305c9d]">{section.title}</h2>
              </div>
              <div className="space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-[#5f6673]">
                    {paragraph}
                  </p>
                ))}
              </div>
              {"points" in section && section.points && (
                <ul className="mt-4 grid gap-2 rounded-md bg-[#f7f8fb] p-4">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-2 text-sm text-[#555]">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#305c9d]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>

    <Footer />
    <WhatsAppButton />
    <MobileBottomBar />
  </div>
);

export const TermsConditions = () => (
  <div className="min-h-screen bg-[#eff1f4] pb-16 md:pb-0">
    <Header />
    <section className="bg-[#305c9d] py-12 text-center">
      <div className="section-container">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h1 className="font-display text-3xl font-extrabold text-white md:text-4xl">Terms and Conditions</h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-white/85 md:text-base">
          These Terms and Conditions govern the use of the Sahyadri Surgical website, products, and services. By
          accessing our website or placing an order with us, you agree to comply with these terms.
        </p>
      </div>
    </section>

    <main className="py-10">
      <div className="section-container">
        <div className="mx-auto max-w-6xl">
          <section className="mb-6 rounded-lg border border-[#d9dde5] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-[#305c9d]">Agreement Overview</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#666]">
                  Please read these terms carefully before using our website, purchasing products, or engaging Sahyadri
                  Surgical for services.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e9eff8]">
                  <PackageCheck className="h-5 w-5 text-[#305c9d]" />
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e9eff8]">
                  <Scale className="h-5 w-5 text-[#305c9d]" />
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                title: "Introduction",
                text: "These Terms and Conditions govern the use of the Sahyadri Surgical website, products, and services. By accessing our website or placing an order with us, you agree to comply with these terms.",
              },
              {
                title: "Orders and Purchases",
                text: "All product orders are subject to availability and acceptance by Sahyadri Surgical. We reserve the right to refuse or cancel any order due to stock limitations, pricing errors, or other unforeseen circumstances.",
              },
              {
                title: "Payment Terms",
                text: "Payment for products and services must be completed using approved payment methods before dispatch unless otherwise agreed in writing. Prices displayed are subject to change without prior notice.",
              },
              {
                title: "Delivery and Shipping",
                text: "Estimated delivery timelines are provided for convenience only and may vary due to logistics, weather conditions, supplier delays, or other factors beyond our control.",
              },
              {
                title: "Product Usage Responsibility",
                text: "Customers are responsible for ensuring that products purchased are suitable for their intended use and are used according to manufacturer instructions and applicable regulations.",
              },
              {
                title: "Product Inspection",
                text: "Customers are advised to inspect all products immediately upon delivery and report any shortages, damages, or discrepancies within the specified reporting period.",
              },
              {
                title: "Returns and Replacements",
                text: "Returns or replacement requests will be considered only in accordance with our Return and Refund Policy and may require proof of purchase and product verification.",
              },
              {
                title: "Warranty Disclaimer",
                text: "Manufacturer warranties, where applicable, shall apply to products supplied by Sahyadri Surgical. Except as expressly stated, no additional warranties are provided.",
              },
              {
                title: "Limitation of Liability",
                text: "Sahyadri Surgical shall not be held responsible for any indirect, incidental, special, or consequential damages arising from the use or inability to use products supplied by us.",
              },
              {
                title: "Force Majeure",
                text: "We shall not be liable for delays or failure to perform obligations due to circumstances beyond our reasonable control, including natural disasters, strikes, transportation issues, or government restrictions.",
              },
              {
                title: "Intellectual Property",
                text: "All website content including logos, graphics, text, product descriptions, and designs remain the intellectual property of Sahyadri Surgical unless otherwise stated.",
              },
              {
                title: "Confidentiality",
                text: "Any confidential information exchanged between Sahyadri Surgical and its customers shall be treated with appropriate care and shall not be disclosed except where required by law.",
              },
              {
                title: "Compliance with Laws",
                text: "Customers agree to comply with all applicable local, state, national, and international laws and regulations while using our products and services.",
              },
              {
                title: "Ownership of Goods",
                text: "Ownership of products shall transfer to the customer only after full payment has been received and cleared by Sahyadri Surgical.",
              },
              {
                title: "Changes to Terms",
                text: "Sahyadri Surgical reserves the right to amend or update these Terms and Conditions at any time. Revised terms will become effective upon publication on the website.",
              },
              {
                title: "Severability",
                text: "If any provision of these Terms and Conditions is found to be invalid or unenforceable, the remaining provisions shall continue to remain in full force and effect.",
              },
              {
                title: "Entire Agreement",
                text: "These Terms and Conditions constitute the complete agreement between Sahyadri Surgical and the customer regarding the use of our website, products, and services.",
              },
              {
                title: "Governing Law",
                text: "These Terms and Conditions shall be governed and interpreted in accordance with the laws of India, and any disputes shall fall under the jurisdiction of the competent courts.",
              },
              {
                title: "Contact Information",
                text: "For any questions regarding these Terms and Conditions, customers may contact Sahyadri Surgical through the contact details provided on our website.",
              },
            ].map((term, index) => (
              <section key={term.title} className="rounded-lg border border-[#d9dde5] bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#e9eff8] text-sm font-bold text-[#305c9d]">
                    {index + 1}
                  </div>
                  <h2 className="font-display text-lg font-bold text-[#305c9d]">{term.title}</h2>
                </div>
                <p className="text-sm leading-relaxed text-[#5f6673]">{term.text}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>

    <Footer />
    <WhatsAppButton />
    <MobileBottomBar />
  </div>
);

export const ReferAndEarn = () => (
  <div className="min-h-screen bg-[#eff1f4] pb-16 md:pb-0">
    <Header />
    <section className="bg-[#305c9d]">
      <div className="section-container py-12 text-center md:py-16">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
          <Gift className="h-8 w-8 text-white" />
        </div>
        <h1 className="font-display text-3xl font-extrabold text-white md:text-5xl">Refer And Earn</h1>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-white/85 md:text-base">
          On successful conversion as per the order value, referral benefits will be shared with you.
        </p>
      </div>
    </section>

    <main className="py-10">
      <div className="section-container">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-lg border border-[#d9dde5] bg-white shadow-sm">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <section className="bg-[#f7f8fb] p-6 md:p-8">
              <div className="rounded-lg border border-[#d9dde5] bg-[#305c9d] p-6 text-white">
                <div className="flex min-h-48 flex-col justify-center rounded-md border border-white/20 bg-white/10 p-6">
                  <Gift className="mb-5 h-12 w-12 text-white" />
                  <h2 className="font-display text-2xl font-bold">Refer. Support. Earn.</h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/85">
                    Share a patient or caregiver requirement and let our team guide them with the right medical
                    equipment.
                  </p>
                </div>
              </div>
              <div className="mt-6 rounded-lg border border-[#d9dde5] bg-white p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e9eff8]">
                    <HeartHandshake className="h-5 w-5 text-[#305c9d]" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-[#305c9d]">Help Others, Earn Rewards</h2>
                </div>
                <p className="text-sm leading-7 text-[#5f6673]">
                  Help patients, caregivers, hospitals, and families by referring Sahyadri Surgical for medical
                  equipment needs. If the referral converts successfully, eligible rewards are processed as per the
                  order value.
                </p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Users, label: "Refer a contact" },
                  { icon: Truck, label: "We support them" },
                  { icon: HandCoins, label: "Earn reward" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-[#d9dde5] bg-white p-4 text-center">
                    <item.icon className="mx-auto mb-2 h-6 w-6 text-[#305c9d]" />
                    <p className="text-xs font-semibold text-[#4f4f4f]">{item.label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="p-6 md:p-8">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-[#305c9d]">Referral Details</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#666]">
                  Share the contact details and requirement. Our team will reach out and guide them with suitable
                  equipment options.
                </p>
              </div>

              <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
                <Field label="Contact name">
                  <Input className="h-11 rounded-md border-[#d9dde5]" />
                </Field>
                <Field label="Mobile Number">
                  <Input className="h-11 rounded-md border-[#d9dde5]" type="tel" />
                </Field>
                <Field label="Location">
                  <Input className="h-11 rounded-md border-[#d9dde5]" />
                </Field>
                <Field label="Requirement">
                  <Textarea className="min-h-[120px] rounded-md border-[#d9dde5]" />
                </Field>

                <label className="flex items-start gap-3 rounded-md border border-[#d9dde5] bg-[#f7f8fb] p-4 text-sm text-[#555]">
                  <Checkbox className="mt-0.5 border-[#305c9d] data-[state=checked]:bg-[#305c9d]" />
                  <span>I accept the terms and conditions</span>
                </label>

                <Button type="submit" className="h-11 w-full rounded-md bg-[#305c9d] text-white hover:bg-[#264d86]">
                  <Send className="mr-2 h-4 w-4" />
                  Submit
                </Button>
              </form>

              <p className="mt-4 text-center text-xs leading-relaxed text-[#7a8290]">
                Referral benefits are applicable only after successful conversion and are subject to order value,
                eligibility, and verification.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
    <Footer />
    <WhatsAppButton />
    <MobileBottomBar />
  </div>
);
