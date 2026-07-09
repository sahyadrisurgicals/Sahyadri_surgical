import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Package, MessageSquare, Images, MessageSquareQuote, Shapes, Truck, FileText, Store, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchDashboardStats, type DashboardStats } from "@/lib/api";

type StatCard = {
  title: string;
  value: number;
  icon: typeof Package;
  hint: string;
  href: string;
};

const statusBadge: Record<string, string> = {
  new: "bg-amber-100 text-amber-700",
  contacted: "bg-blue-100 text-blue-700",
  closed: "bg-emerald-100 text-emerald-700",
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load dashboard stats");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const cards: StatCard[] = useMemo(
    () => [
      { title: "Services", value: stats?.totalServices ?? 0, icon: Truck, hint: "Active service listings", href: "/admin/services" },
      { title: "Products", value: stats?.totalProducts ?? 0, icon: Package, hint: "Managed product records", href: "/admin/products" },
      { title: "Categories", value: stats?.totalCategories ?? 0, icon: Shapes, hint: "Product categories", href: "/admin/categories" },
      { title: "Gallery", value: stats?.totalGallery ?? 0, icon: Images, hint: "Uploaded images", href: "/admin/gallery" },
      { title: "Testimonials", value: stats?.totalTestimonials ?? 0, icon: MessageSquareQuote, hint: "Published testimonials", href: "/admin/testimonials" },
      { title: "Blogs", value: stats?.totalBlogs ?? 0, icon: FileText, hint: "Blog and update posts", href: "/admin/blogs" },
      { title: "Enquiries", value: stats?.totalEnquiries ?? 0, icon: MessageSquare, hint: "Customer enquiries", href: "/admin/inquiries" },
      { title: "Vendors", value: stats?.totalVendors ?? 0, icon: Store, hint: "Vendor registrations", href: "/admin/vendors" },
    ],
    [stats]
  );

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title} className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="mt-2 font-display text-3xl font-bold text-foreground">{loading ? "..." : card.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
                </div>
                <div className="rounded-2xl bg-[#edf2fb] p-3 text-[#2c5aa1]">
                  <card.icon className="h-6 w-6" />
                </div>
              </CardContent>
              <div className="border-t border-border px-5 py-3">
                <Link to={card.href} className="text-sm font-medium text-[#2c5aa1] hover:underline">
                  Open module
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="font-display">Recent Enquiries</CardTitle>
                <p className="text-sm text-muted-foreground">Latest customer requests from the website.</p>
              </div>
              <Link to="/admin/inquiries" className="text-sm font-medium text-[#2c5aa1] hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading recent enquiries...
                </div>
              ) : stats?.recentEnquiries?.length ? (
                <div className="space-y-3">
                  {stats.recentEnquiries.map((item) => (
                    <div key={item.id} className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-foreground">{item.name}</p>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge[item.status] || "bg-slate-100 text-slate-700"}`}>
                              {item.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.phone}
                            {item.email ? ` • ${item.email}` : ""}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Interested in: {item.service_interested || "General enquiry"}
                          </p>
                          {item.message ? <p className="text-sm italic text-muted-foreground">{item.message}</p> : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
                  No enquiries yet. Customer submissions will appear here.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="font-display">Quick Actions</CardTitle>
              <p className="text-sm text-muted-foreground">Jump into the most-used admin modules.</p>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                { href: "/admin/products", label: "Manage Products", icon: Package },
                { href: "/admin/categories", label: "Manage Categories", icon: Shapes },
                { href: "/admin/gallery", label: "Manage Gallery", icon: Images },
                { href: "/admin/testimonials", label: "Manage Testimonials", icon: MessageSquareQuote },
                { href: "/admin/blogs", label: "Manage Blogs", icon: FileText },
                { href: "/admin/vendors", label: "Review Vendors", icon: Store },
              ].map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <item.icon className="h-4 w-4 text-[#2c5aa1]" />
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
