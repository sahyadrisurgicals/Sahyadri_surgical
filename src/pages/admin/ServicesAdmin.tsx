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
import { Plus, Pencil, Trash2, Search, Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { createService, deleteService, fetchServices, updateService, uploadFile } from "@/lib/api";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type ServiceRow = {
  id: number;
  title: string;
  slug: string;
  short_description?: string;
  full_description?: string;
  image?: string;
  icon?: string;
  features?: string[];
  display_order?: number;
  is_active?: number | boolean;
};

const initialForm = {
  title: "",
  slug: "",
  short_description: "",
  full_description: "",
  image: "",
  icon: "",
  featuresText: "",
  display_order: "0",
  is_active: true,
};

export default function ServicesAdmin() {
  const [items, setItems] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchServices({ all: true, allowFallback: false });
      setItems(data as ServiceRow[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((item) =>
      [item.title, item.slug, item.short_description, item.icon].some((value) => String(value || "").toLowerCase().includes(q))
    );
  }, [items, search]);

  const reset = () => {
    setForm(initialForm);
    setEditingId(null);
    setImageFile(null);
  };

  const openCreate = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (row: ServiceRow) => {
    setEditingId(row.id);
    setForm({
      title: row.title || "",
      slug: row.slug || "",
      short_description: row.short_description || "",
      full_description: row.full_description || "",
      image: row.image || "",
      icon: row.icon || "",
      featuresText: (row.features || []).join("\n"),
      display_order: String(row.display_order ?? 0),
      is_active: Boolean(row.is_active),
    });
    setImageFile(null);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Service title is required");
      return;
    }
    setSubmitting(true);
    try {
      let image = form.image.trim();
      if (imageFile) {
        const uploaded = await uploadFile(imageFile);
        image = uploaded.url;
      }

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        short_description: form.short_description.trim(),
        full_description: form.full_description.trim(),
        image,
        icon: form.icon.trim(),
        features: form.featuresText
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean),
        display_order: Number(form.display_order || 0),
        is_active: form.is_active,
      };
      if (editingId) {
        await updateService(editingId, payload);
        toast.success("Service updated");
      } else {
        await createService(payload);
        toast.success("Service created");
      }
      setOpen(false);
      reset();
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save service");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await deleteService(id);
      toast.success("Service deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete service");
    }
  };

  return (
    <AdminLayout title="Services">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="pl-10" />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="bg-[#2c5aa1] hover:bg-[#244a88]">
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Service" : "Add Service"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Short Description</Label>
                  <Textarea value={form.short_description} onChange={(e) => setForm((prev) => ({ ...prev, short_description: e.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Full Description</Label>
                  <Textarea value={form.full_description} onChange={(e) => setForm((prev) => ({ ...prev, full_description: e.target.value }))} className="min-h-[120px]" />
                </div>
                <div className="md:col-span-2">
                  <ImageUploadField
                    label="Service Image"
                    value={form.image}
                    file={imageFile}
                    onFileChange={setImageFile}
                    previewAlt={form.title || "Service preview"}
                    helperText="Choose a service image file to upload."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Input value={form.icon} onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))} placeholder="truck, heart-pulse..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Features (one per line)</Label>
                  <Textarea value={form.featuresText} onChange={(e) => setForm((prev) => ({ ...prev, featuresText: e.target.value }))} className="min-h-[120px]" />
                </div>
                <div className="grid grid-cols-2 gap-3 md:col-span-2">
                  <div className="space-y-2">
                    <Label>Display Order</Label>
                    <Input type="number" value={form.display_order} onChange={(e) => setForm((prev) => ({ ...prev, display_order: e.target.value }))} />
                  </div>
                  <div className="flex items-end justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">Active</p>
                      <p className="text-xs text-muted-foreground">Show on frontend</p>
                    </div>
                    <Switch checked={form.is_active} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))} />
                  </div>
                </div>
                <Button onClick={handleSave} disabled={submitting} className="md:col-span-2 bg-[#2c5aa1] hover:bg-[#244a88]">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? (
                    "Update Service"
                  ) : (
                    "Create Service"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border/70">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading services...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">No services found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="p-4">Service</th>
                      <th className="p-4">Slug</th>
                      <th className="p-4">Order</th>
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
                              <Truck className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{row.title}</p>
                              <p className="text-xs text-muted-foreground">{row.short_description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{row.slug}</td>
                        <td className="p-4">{row.display_order ?? 0}</td>
                        <td className="p-4">
                          <Badge variant={row.is_active ? "default" : "secondary"} className={row.is_active ? "bg-trust/10 text-trust border-trust/20" : ""}>
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
