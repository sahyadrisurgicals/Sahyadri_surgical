import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Search, Star, Trash2, MessageSquareQuote } from "lucide-react";
import { toast } from "sonner";
import {
  createTestimonial,
  deleteTestimonial,
  fetchTestimonials,
  type TestimonialRecord,
  updateTestimonial,
  uploadFile,
} from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const emptyForm = {
  client_name: "",
  client_photo: "",
  review_text: "",
  rating: "5",
  location: "",
  display_order: "0",
  is_active: true,
};

export default function TestimonialsAdmin() {
  const [items, setItems] = useState<TestimonialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchTestimonials({ all: true, allowFallback: false });
      setItems(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview("");
      return;
    }
    const preview = URL.createObjectURL(photoFile);
    setPhotoPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [photoFile]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((item) =>
      [item.client_name, item.location, item.review_text].some((value) => String(value || "").toLowerCase().includes(q))
    );
  }, [items, search]);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setPhotoFile(null);
    setPhotoPreview("");
  };

  const openCreate = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (row: TestimonialRecord) => {
    setEditingId(row.id);
    setForm({
      client_name: row.client_name || "",
      client_photo: row.client_photo || "",
      review_text: row.review_text || "",
      rating: String(row.rating || 5),
      location: row.location || "",
      display_order: String(row.display_order ?? 0),
      is_active: Boolean(row.is_active),
    });
    setPhotoFile(null);
    setPhotoPreview(row.client_photo || "");
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.client_name.trim() || !form.review_text.trim()) {
      toast.error("Client name and review are required");
      return;
    }
    setSaving(true);
    try {
      let photoUrl = form.client_photo.trim();
      if (photoFile) {
        const uploaded = await uploadFile(photoFile);
        photoUrl = uploaded.url;
      }
      const payload = {
        client_name: form.client_name.trim(),
        client_photo: photoUrl,
        review_text: form.review_text.trim(),
        rating: Number(form.rating || 5),
        location: form.location.trim(),
        display_order: Number(form.display_order || 0),
        is_active: form.is_active,
      };
      if (editingId) {
        await updateTestimonial(editingId, payload);
        toast.success("Testimonial updated");
      } else {
        await createTestimonial(payload);
        toast.success("Testimonial created");
      }
      setOpen(false);
      reset();
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save testimonial");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      await deleteTestimonial(id);
      toast.success("Testimonial deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete testimonial");
    }
  };

  return (
    <AdminLayout title="Testimonials">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search testimonials..." className="pl-10" />
          </div>
          <Dialog open={open} onOpenChange={(next) => {
            setOpen(next);
            if (!next) reset();
          }}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="bg-[#2c5aa1] hover:bg-[#244a88]">
                <Plus className="mr-2 h-4 w-4" />
                Add Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input value={form.client_name} onChange={(event) => setForm((prev) => ({ ...prev, client_name: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <Select value={form.rating} onValueChange={(value) => setForm((prev) => ({ ...prev, rating: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["5", "4", "3", "2", "1"].map((value) => (
                        <SelectItem key={value} value={value}>
                          {value} Stars
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input type="number" value={form.display_order} onChange={(event) => setForm((prev) => ({ ...prev, display_order: event.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Client Photo</Label>
                  <Input type="file" accept="image/*" onChange={(event) => setPhotoFile(event.target.files?.[0] || null)} />
                  {(photoPreview || form.client_photo) && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-border bg-white">
                      <img src={photoFile ? photoPreview : form.client_photo || ""} alt="Client preview" className="h-48 w-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Review *</Label>
                  <Textarea value={form.review_text} onChange={(event) => setForm((prev) => ({ ...prev, review_text: event.target.value }))} className="min-h-[140px]" />
                </div>
                <div className="flex items-end justify-between rounded-lg border border-border p-3 md:col-span-2">
                  <div>
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-xs text-muted-foreground">Show testimonial on the frontend</p>
                  </div>
                  <Switch checked={form.is_active} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))} />
                </div>
                <Button onClick={handleSave} disabled={saving} className="md:col-span-2 bg-[#2c5aa1] hover:bg-[#244a88]">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? (
                    "Update Testimonial"
                  ) : (
                    "Create Testimonial"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading testimonials...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">No testimonials found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="p-4">Client</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.id} className="border-b hover:bg-muted/20">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-full border border-border bg-muted">
                              {row.client_photo ? (
                                <img src={row.client_photo} alt={row.client_name} className="h-full w-full object-cover" />
                              ) : (
                                <MessageSquareQuote className="m-3 h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{row.client_name}</p>
                              <p className="max-w-md truncate text-xs text-muted-foreground">{row.review_text}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{row.location || "-"}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-medium">{row.rating}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={row.is_active ? "default" : "secondary"} className={row.is_active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}>
                            {row.is_active ? "Active" : "Inactive"}
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
      </div>
    </AdminLayout>
  );
}
