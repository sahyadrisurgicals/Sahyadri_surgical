import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Phone, Clock, CheckCircle, ChevronLeft, ChevronRight, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteEnquiry, fetchEnquiries, updateEnquiry, type EnquiryRecord } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusMeta: Record<
  string,
  {
    label: string;
    className: string;
    icon: ReactNode;
  }
> = {
  new: {
    label: "New",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    icon: <Clock className="h-3 w-3" />,
  },
  contacted: {
    label: "Contacted",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <Phone className="h-3 w-3" />,
  },
  closed: {
    label: "Closed",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: <CheckCircle className="h-3 w-3" />,
  },
};

export default function InquiriesAdmin() {
  const [items, setItems] = useState<EnquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetchEnquiries({
        page,
        limit: 10,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
      setItems(response.items);
      setTotalPages(response.pages || 1);
      setTotalItems(response.total || 0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page, statusFilter, search]);

  const filteredCount = useMemo(() => totalItems, [totalItems]);

  const handleSearch = () => {
    setPage(1);
  };

  const handleStatusChange = async (id: number, status: EnquiryRecord["status"]) => {
    try {
      await updateEnquiry(id, { status });
      toast.success("Enquiry status updated");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update enquiry");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this enquiry?")) return;
    try {
      await deleteEnquiry(id);
      toast.success("Enquiry deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete enquiry");
    }
  };

  return (
    <AdminLayout title="Inquiries">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search enquiries..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch();
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setPage(1);
              setStatusFilter(value);
            }}
          >
            <SelectTrigger className="w-full lg:w-44">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleSearch}>
            Apply Search
          </Button>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading enquiries...
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">No enquiries found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="p-4">Customer</th>
                      <th className="p-4">Service</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/20">
                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.phone}
                              {item.email ? ` • ${item.email}` : ""}
                            </p>
                            {item.message ? <p className="max-w-md text-xs text-muted-foreground">{item.message}</p> : null}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{item.service_interested || "General enquiry"}</td>
                        <td className="p-4">
                          <Badge variant="outline" className={`${statusMeta[item.status]?.className || "bg-slate-100 text-slate-700 border-slate-200"} inline-flex items-center gap-1`}>
                            {statusMeta[item.status]?.icon}
                            {statusMeta[item.status]?.label || item.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(item.created_at).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col items-end gap-2">
                            <Select value={item.status} onValueChange={(value) => handleStatusChange(item.id, value as EnquiryRecord["status"])}>
                              <SelectTrigger className="h-8 w-36 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleDelete(Number(item.id))}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Showing {items.length} of {filteredCount} enquiries
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {Math.max(totalPages, 1)}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
