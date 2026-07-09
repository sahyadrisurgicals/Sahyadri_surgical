import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Pencil, Search, Trash2, Store } from "lucide-react";
import { toast } from "sonner";
import { deleteVendor, fetchVendors, type VendorRecord, updateVendor } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const emptyForm = {
  vendor_name: "",
  business_name: "",
  phone: "",
  email: "",
  address: "",
  category: "",
  gst_number: "",
  status: "pending",
  admin_notes: "",
};

const statusClass: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

export default function VendorsAdmin() {
  const [items, setItems] = useState<VendorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async (nextStatus = statusFilter) => {
    setLoading(true);
    try {
      const data = await fetchVendors(nextStatus === "all" ? {} : { status: nextStatus });
      setItems(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [statusFilter]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((item) =>
      [
        item.vendor_name,
        item.business_name,
        item.phone,
        item.email,
        item.category,
        item.gst_number,
        item.status,
      ].some((value) => String(value || "").toLowerCase().includes(q))
    );
  }, [items, search]);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openEdit = (row: VendorRecord) => {
    setEditingId(row.id);
    setForm({
      vendor_name: row.vendor_name || "",
      business_name: row.business_name || "",
      phone: row.phone || "",
      email: row.email || "",
      address: row.address || "",
      category: row.category || "",
      gst_number: row.gst_number || "",
      status: row.status || "pending",
      admin_notes: row.admin_notes || "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!editingId) {
      toast.error("Vendor records are created from the frontend registration form");
      return;
    }
    if (!form.vendor_name.trim() && !form.business_name.trim()) {
      toast.error("Vendor name or business name is required");
      return;
    }
    setSaving(true);
    try {
      await updateVendor(editingId, {
        vendor_name: form.vendor_name.trim(),
        business_name: form.business_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        category: form.category.trim(),
        gst_number: form.gst_number.trim(),
        status: form.status as VendorRecord["status"],
        admin_notes: form.admin_notes.trim(),
      });
      toast.success("Vendor updated");
      setOpen(false);
      reset();
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update vendor");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this vendor record?")) return;
    try {
      await deleteVendor(id);
      toast.success("Vendor deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete vendor");
    }
  };

  return (
    <AdminLayout title="Vendors">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vendors..." className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading vendors...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">No vendor records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="p-4">Vendor</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.id} className="border-b hover:bg-muted/20">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf2fb] text-[#2c5aa1]">
                              <Store className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{row.vendor_name || row.business_name}</p>
                              <p className="text-xs text-muted-foreground">{row.business_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          <div className="space-y-1">
                            <p>{row.phone}</p>
                            <p>{row.email}</p>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{row.category || "-"}</td>
                        <td className="p-4">
                          <Badge variant="outline" className={statusClass[row.status] || "bg-slate-100 text-slate-700"}>
                            {row.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(row.id)}>
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

        <Dialog open={open} onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset();
        }}>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Vendor</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Vendor Name</Label>
                <Input value={form.vendor_name} onChange={(event) => setForm((prev) => ({ ...prev, vendor_name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input value={form.business_name} onChange={(event) => setForm((prev) => ({ ...prev, business_name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Textarea value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>GST Number</Label>
                <Input value={form.gst_number} onChange={(event) => setForm((prev) => ({ ...prev, gst_number: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Admin Notes</Label>
                <Textarea value={form.admin_notes} onChange={(event) => setForm((prev) => ({ ...prev, admin_notes: event.target.value }))} />
              </div>
              <Button onClick={handleSave} disabled={saving} className="md:col-span-2 bg-[#2c5aa1] hover:bg-[#244a88]">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Update Vendor"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
