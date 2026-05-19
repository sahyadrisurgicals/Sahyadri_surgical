import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInquiries } from "@/hooks/useAdminData";
import { Search, Trash2, Phone, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function InquiriesAdmin() {
  const { inquiries, updateStatus, deleteInquiry } = useInquiries();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = inquiries.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.equipment.toLowerCase().includes(search.toLowerCase()) ||
      i.phone.includes(search);
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColors: Record<string, string> = {
    pending: "bg-orange-warm/10 text-accent border-accent/20",
    contacted: "bg-primary/10 text-primary border-primary/20",
    resolved: "bg-trust/10 text-trust border-trust/20",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-3 w-3" />,
    contacted: <Phone className="h-3 w-3" />,
    resolved: <CheckCircle className="h-3 w-3" />,
  };

  return (
    <AdminLayout title="Inquiries">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search inquiries..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <Card className="card-shadow">
            <CardContent className="py-12 text-center text-muted-foreground">
              No inquiries found. They'll appear here when customers submit the inquiry form.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filtered.map(inquiry => (
              <Card key={inquiry.id} className="card-shadow hover:card-shadow-hover transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{inquiry.name}</p>
                        <Badge variant="outline" className={statusColors[inquiry.status]}>
                          {statusIcons[inquiry.status]}
                          <span className="ml-1 capitalize">{inquiry.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        📱 {inquiry.phone} • 🔧 {inquiry.equipment}
                      </p>
                      {inquiry.message && (
                        <p className="text-sm text-muted-foreground italic">"{inquiry.message}"</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(inquiry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={inquiry.status}
                        onValueChange={(v) => {
                          updateStatus(inquiry.id, v as any);
                          toast.success(`Status updated to ${v}`);
                        }}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-8 w-8"
                        onClick={() => { deleteInquiry(inquiry.id); toast.success("Inquiry deleted"); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
