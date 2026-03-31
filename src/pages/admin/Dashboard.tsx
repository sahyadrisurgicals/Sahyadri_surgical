import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, MessageSquare, TrendingUp, Users, IndianRupee, ShoppingCart } from "lucide-react";
import { products } from "@/data/products";
import { useInquiries } from "@/hooks/useAdminData";

export default function Dashboard() {
  const { inquiries } = useInquiries();

  const stats = [
    { title: "Total Products", value: products.length, icon: Package, color: "text-primary" },
    { title: "Total Inquiries", value: inquiries.length, icon: MessageSquare, color: "text-accent" },
    { title: "Pending Inquiries", value: inquiries.filter(i => i.status === "pending").length, icon: Users, color: "text-orange-warm" },
    { title: "This Month", value: inquiries.filter(i => new Date(i.date).getMonth() === new Date().getMonth()).length, icon: TrendingUp, color: "text-trust" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="card-shadow hover:card-shadow-hover transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold font-display text-foreground mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-10 w-10 ${stat.color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Inquiries */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-display">Recent Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {inquiries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No inquiries yet. They'll appear here when customers submit the inquiry form.</p>
            ) : (
              <div className="space-y-3">
                {inquiries.slice(0, 5).map((inquiry) => (
                  <div key={inquiry.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                    <div>
                      <p className="font-medium text-foreground">{inquiry.name}</p>
                      <p className="text-sm text-muted-foreground">{inquiry.equipment} • {inquiry.phone}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      inquiry.status === "pending" ? "bg-orange-warm/10 text-accent" :
                      inquiry.status === "contacted" ? "bg-primary/10 text-primary" :
                      "bg-trust/10 text-trust"
                    }`}>
                      {inquiry.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="font-display text-base">Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Hospital Beds", "Oxygen Equipment", "Wheelchairs", "BiPAP / CPAP"].map((cat, i) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{cat}</span>
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div className="bg-primary rounded-full h-2" style={{ width: `${90 - i * 18}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="font-display text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="/admin/products" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">Manage Products</span>
              </a>
              <a href="/admin/inquiries" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <MessageSquare className="h-5 w-5 text-accent" />
                <span className="text-sm text-foreground">View Inquiries</span>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
