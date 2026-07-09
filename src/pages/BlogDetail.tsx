import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomBar from "@/components/MobileBottomBar";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Tag } from "lucide-react";
import { fetchBlog, type BlogRecord } from "@/lib/api";
import { fallbackBlogs, formatBlogDate, getBlogCategory, getReadTime } from "@/pages/Blog";

function splitContent(content: string) {
  return content
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

const BlogDetail = () => {
  const { slug = "" } = useParams();
  const [blog, setBlog] = useState<BlogRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fallback = fallbackBlogs.find((item) => item.slug === slug) || fallbackBlogs[0];

    const loadBlog = async () => {
      setLoading(true);
      try {
        const data = await fetchBlog(slug);
        if (active) setBlog(data);
      } catch {
        if (active) setBlog(fallback);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadBlog();
    return () => {
      active = false;
    };
  }, [slug]);

  const paragraphs = useMemo(() => splitContent(blog?.content || blog?.short_description || ""), [blog]);
  const relatedPosts = fallbackBlogs.filter((item) => item.slug !== blog?.slug).slice(0, 2);

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#f5f8fc]">
        <Header />
        <main className="section-container py-20 text-center text-muted-foreground">
          {loading ? "Loading blog..." : "Blog not found."}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] pb-16 md:pb-0">
      <Header />

      <main>
        <section className="bg-white">
          <div className="section-container py-8 md:py-12">
            <div className="mb-6 text-sm text-muted-foreground">
              Home / <Link to="/blog" className="hover:text-[#2c5aa1]">Blog</Link> /{" "}
              <span className="font-medium text-foreground">{blog.title}</span>
            </div>

            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2c5aa1] hover:text-[#1f447e]">
              <ArrowLeft className="h-4 w-4" />
              Back to Blogs
            </Link>

            <div className="mt-5 grid gap-8 md:grid-cols-[0.95fr_1.05fr] md:items-center">
              <div>
                <div className="flex flex-wrap gap-3 text-sm text-[#667184]">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef5ff] px-3 py-1 font-semibold text-[#2c5aa1]">
                    <Tag className="h-3.5 w-3.5" />
                    {getBlogCategory(blog)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    {formatBlogDate(blog.published_at)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4" />
                    {getReadTime(blog.content || blog.short_description)}
                  </span>
                </div>
                <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-[#17233c] md:text-5xl">
                  {blog.title}
                </h1>
                <p className="mt-4 text-base leading-7 text-[#5d687a] md:text-lg">{blog.short_description}</p>
              </div>

              <div className="overflow-hidden rounded-lg shadow-xl shadow-[#1d3a6d]/10">
                <img src={blog.image} alt={blog.title} className="aspect-[4/3] h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="section-container grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <article className="rounded-lg border border-[#e2e8f2] bg-white p-6 shadow-sm md:p-8">
              <div className="prose prose-slate max-w-none">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mb-5 text-base leading-8 text-[#3f4b5f]">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 rounded-lg bg-[#eef5ff] p-5">
                <h2 className="font-display text-xl font-bold text-[#17233c]">Quick next step</h2>
                <p className="mt-2 text-sm leading-6 text-[#5d687a]">
                  If you are planning care for a patient, list the diagnosis, expected recovery duration, and doctor's equipment advice before choosing rent or buy options.
                </p>
                <Link
                  to="/contact"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2c5aa1] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Get Guidance
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>

            <aside className="space-y-5">
              <div className="rounded-lg border border-[#e2e8f2] bg-white p-5 shadow-sm">
                <h2 className="font-display text-lg font-bold text-[#17233c]">Related Articles</h2>
                <div className="mt-4 space-y-4">
                  {relatedPosts.map((post) => (
                    <Link key={post.slug} to={`/blog/${post.slug}`} className="group block">
                      <img src={post.image} alt={post.title} className="aspect-[16/9] w-full rounded-md object-cover" />
                      <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-[#17233c] group-hover:text-[#2c5aa1]">
                        {post.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-[#203f77] p-5 text-white">
                <h2 className="font-display text-lg font-bold">Need equipment support?</h2>
                <p className="mt-2 text-sm leading-6 text-white/85">
                  Talk to Sahyadri Surgical for rental, purchase, delivery, and setup guidance.
                </p>
                <Link to="/products?mode=rent" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                  Explore Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </div>
  );
};

export default BlogDetail;
