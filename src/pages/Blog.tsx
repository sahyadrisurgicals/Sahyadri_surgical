import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, FileText, Search, Stethoscope } from "lucide-react";
import { useBlogs } from "@/hooks/useContent";
import type { BlogRecord } from "@/lib/api";

export const fallbackBlogs: BlogRecord[] = [
  {
    id: 1,
    title: "Home ICU Setup Checklist: What Families Should Arrange First",
    slug: "home-icu-setup-checklist",
    image: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=1200&h=900&fit=crop",
    short_description: "A practical guide for families preparing a safe home ICU setup after discharge.",
    content:
      "When a loved one is discharged, the first 48 hours are critical. Start by choosing a clean, well-ventilated room with enough space for a hospital bed, oxygen device, monitor, and caregiver movement.\n\nConfirm the doctor's equipment list before ordering anything. Most home ICU setups need a hospital bed, air mattress, oxygen support, suction machine, patient monitor, IV stand, and backup power planning.\n\nKeep emergency contacts visible, train family members on basic device use, and schedule support checks so the patient remains comfortable and safe.",
    seo_title: "Home ICU Setup Checklist",
    meta_description: "Practical guide for families preparing a safe home ICU setup.",
    keywords: "Home ICU, Oxygen Support, Patient Care",
    published: true,
    published_at: "2026-05-19",
    display_order: 1,
  },
  {
    id: 2,
    title: "How To Choose The Right Home ICU Equipment",
    slug: "choose-home-icu-equipment",
    image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1200&h=900&fit=crop",
    short_description: "A practical checklist for families who need hospital-grade support at home.",
    content:
      "The right equipment depends on the patient's diagnosis, mobility, oxygen requirement, and expected recovery duration. Avoid choosing devices only by price; focus on safety, service support, and ease of use.\n\nFor respiratory support, check oxygen flow requirements and whether a concentrator, cylinder backup, or both are needed. For bed-bound patients, prioritize a comfortable hospital bed, air mattress, and transfer aids.\n\nAsk whether installation, demonstration, replacement support, and maintenance are included. Good guidance saves time and prevents avoidable stress.",
    seo_title: "Choose the Right Home ICU Equipment",
    meta_description: "Checklist for choosing hospital-grade support at home.",
    keywords: "Buying Guide, Patient Monitor, Oxygen Concentrator",
    published: true,
    published_at: "2026-05-12",
    display_order: 2,
  },
  {
    id: 3,
    title: "Rent Vs Buy: What Works Best For Recovery Care",
    slug: "rent-vs-buy-recovery-care",
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1200&h=900&fit=crop",
    short_description: "Understand when renting is smarter and when buying becomes more economical.",
    content:
      "Renting works well for short-term recovery, post-surgery care, temporary mobility support, and equipment that may be needed only for a few weeks or months.\n\nBuying is better when the patient has long-term needs, repeated use, or a permanent condition that requires daily support. Items like wheelchairs, walkers, and some comfort accessories may be practical purchases.\n\nCompare the total expected duration, service requirements, hygiene needs, and replacement support before deciding. A mixed plan often works best: rent larger devices and buy personal-use accessories.",
    seo_title: "Rent vs Buy for Recovery Care",
    meta_description: "Compare rental and purchase options for medical equipment.",
    keywords: "Cost Planning, Medical Equipment Rental, Home Care",
    published: true,
    published_at: "2026-04-28",
    display_order: 3,
  },
];

export function formatBlogDate(value?: string | null) {
  if (!value) return "Care Guide";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function getBlogCategory(blog: Pick<BlogRecord, "keywords">) {
  return blog.keywords?.split(",").map((item) => item.trim()).filter(Boolean)[0] || "Care Guide";
}

export function getReadTime(text = "") {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(3, Math.ceil(words / 180))} min read`;
}

const Blog = () => {
  const { data: blogRows, loading } = useBlogs();
  const blogs = blogRows.length ? blogRows : fallbackBlogs;
  const featuredPost = blogs[0];
  const posts = blogs.slice(1);

  return (
    <div className="min-h-screen bg-[#f5f8fc] pb-16 md:pb-0">
      <Header />

      <section className="bg-[#305c9d] py-12 text-center">
        <div className="section-container">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white md:text-4xl">Blog & Care Guides</h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-white/85 md:text-base">
            Practical articles for home healthcare equipment, ICU-at-home setup, patient recovery, and caregiver support.
          </p>
        </div>
      </section>

      <section className="bg-white py-10 md:py-14">
        <div className="section-container">
          <div className="mb-6 text-sm text-muted-foreground">
            Home / <span className="font-medium text-foreground">Blog</span>
          </div>

          <Link to={`/blog/${featuredPost.slug}`} className="group grid overflow-hidden rounded-lg border border-[#e2e8f2] bg-white shadow-xl shadow-[#1d3a6d]/10 md:grid-cols-[0.95fr_1.05fr]">
            <div className="relative min-h-[280px] overflow-hidden">
              <img src={featuredPost.image} alt={featuredPost.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="flex flex-col justify-center p-6 md:p-8">
              <span className="w-fit rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold text-[#2c5aa1]">
                Featured Guide
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-[#17233c] md:text-3xl">{featuredPost.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#667184] md:text-base">{featuredPost.short_description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2c5aa1]">
                Read Details
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="section-container">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#2c5aa1]">Latest Articles</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-[#17233c] md:text-3xl">Care guides with clear next steps</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#6a7485] shadow-sm">
              <Search className="h-4 w-4" />
              {loading ? "Loading articles..." : `${blogs.length} articles`}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug || post.title}
                to={`/blog/${post.slug}`}
                className="group flex min-h-full flex-col overflow-hidden rounded-lg border border-[#e2e8f2] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1d3a6d]/10"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#eaf0f8]">
                  <img src={post.image} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#2c5aa1] shadow-sm">
                    {getBlogCategory(post)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#758196]">
                    <span>{formatBlogDate(post.published_at)}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {getReadTime(post.content || post.short_description)}
                    </span>
                  </div>
                  <h3 className="mt-3 line-clamp-2 font-display text-xl font-bold leading-snug text-[#17233c]">{post.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#667184]">{post.short_description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2c5aa1]">
                    Read Details
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="section-container">
          <div className="grid gap-5 rounded-lg bg-[#203f77] p-6 text-white md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div>
              <div className="inline-flex rounded-full bg-white/10 p-2">
                <Stethoscope className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold md:text-3xl">Need help choosing the right equipment?</h2>
              <p className="mt-3 max-w-2xl text-white/85">
                Share the patient condition and expected duration. The Sahyadri team can guide rent or purchase options clearly.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#203f77] transition-colors hover:bg-[#eef4ff]"
            >
              Contact Team
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </div>
  );
};

export default Blog;
