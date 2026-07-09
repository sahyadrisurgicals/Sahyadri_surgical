import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";
import { Link } from "react-router-dom";
import { ArrowRight, BedDouble, Clock3, HeartPulse, ShieldCheck } from "lucide-react";
import { useBlogs } from "@/hooks/useContent";

const fallbackBlogs = [
  {
    title: "Home ICU Setup Checklist: What Families Should Arrange First",
    excerpt:
      "When a loved one is discharged, the first 48 hours are critical. This checklist helps you prioritize the right equipment, room planning, and support services.",
    date: "May 19, 2026",
    readTime: "7 min read",
    category: "Home ICU",
  },
  {
    title: "How To Choose The Right Home ICU Equipment",
    excerpt:
      "A practical checklist for families who need hospital-grade support at home, from oxygen devices to patient monitors.",
    date: "May 12, 2026",
    readTime: "5 min read",
    category: "Buying Guide",
  },
  {
    title: "Rent Vs Buy: What Works Best For Recovery Care",
    excerpt:
      "Understand when renting is the smarter option and when buying becomes cost-effective for long-term care.",
    date: "April 28, 2026",
    readTime: "4 min read",
    category: "Cost Planning",
  },
];

const topics = [
  {
    icon: BedDouble,
    title: "Patient Comfort Setup",
    text: "Beds, mattress selection, positioning, and movement support for safer recovery.",
  },
  {
    icon: HeartPulse,
    title: "Recovery Monitoring",
    text: "Tracking vitals, warning signs, and device usage at home with confidence.",
  },
  {
    icon: ShieldCheck,
    title: "Hygiene And Safety",
    text: "Cleaning protocols and preventive checks to keep equipment reliable every day.",
  },
];

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const Blog = () => {
  const { data: blogRows } = useBlogs();
  const blogs = blogRows.length
    ? blogRows.map((blog) => ({
        title: blog.title,
        excerpt: blog.short_description,
        date: formatDate(blog.published_at),
        readTime: "5 min read",
        category: blog.keywords ? blog.keywords.split(",")[0] : "Insights",
        slug: blog.slug,
      }))
    : fallbackBlogs;

  const featuredPost = blogs[0];
  const posts = blogs.slice(1);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />

      <section className="gradient-hero py-14 md:py-20">
        <div className="section-container">
          <p className="text-sm font-semibold tracking-wide text-primary-foreground/80">Sahyadri Insights</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-primary-foreground md:text-5xl">
            Blog & Care Guides
          </h1>
          <p className="mt-4 max-w-2xl text-primary-foreground/85">
            Practical guides for home healthcare equipment, patient recovery, and caregiver support.
          </p>
          <Link
            to="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#2c5aa1] transition-colors hover:bg-[#f4f7ff]"
          >
            Talk to Our Team
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="section-container">
          <div className="rounded-3xl border border-border bg-card p-6 card-shadow md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#d7e4f5] px-3 py-1 text-xs font-semibold text-[#2c5aa1]">
                {featuredPost.category}
              </span>
              <span className="text-sm text-muted-foreground">{featuredPost.date}</span>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                {featuredPost.readTime}
              </span>
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-foreground md:text-3xl">
              {featuredPost.title}
            </h2>
            <p className="mt-3 max-w-3xl text-muted-foreground">{featuredPost.excerpt}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/products?mode=rent"
                className="rounded-full bg-[#2c5aa1] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Explore Rental Equipment
              </Link>
              <Link
                to="/contact"
                className="rounded-full border border-[#c8d4e7] px-5 py-2 text-sm font-semibold text-[#2c5aa1] transition-colors hover:bg-[#f4f7fb]"
              >
                Get Personal Guidance
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10 md:pb-14">
        <div className="section-container">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Latest Articles</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.title}
                className="rounded-2xl border border-border bg-card p-6 transition-transform card-shadow hover:-translate-y-0.5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
                    {post.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                </div>
                <h2 className="mt-3 font-display text-xl font-bold text-foreground">{post.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  <Clock3 className="h-4 w-4" />
                  {post.readTime}
                </p>
                <Link
                  to="/contact"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#2c5aa1] hover:text-[#1f447e]"
                >
                  Read More
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card py-10 md:py-14">
        <div className="section-container">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Popular Topics</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {topics.map((topic) => (
              <article key={topic.title} className="rounded-2xl border border-border bg-background p-5">
                <div className="mb-4 inline-flex rounded-xl bg-[#d7e4f5] p-3 text-[#2c5aa1]">
                  <topic.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">{topic.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{topic.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="section-container">
          <div className="rounded-2xl bg-[#2c5aa1] p-6 text-white md:p-8">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Need Help Choosing Equipment?</h2>
            <p className="mt-3 max-w-2xl text-white/85">
              Our specialists can guide you based on your patient condition, budget, and treatment timeline.
            </p>
            <Link
              to="/contact"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#2c5aa1] transition-colors hover:bg-[#f2f6ff]"
            >
              Contact Sahyadri Team
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

