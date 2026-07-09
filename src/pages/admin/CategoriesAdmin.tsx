import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, Loader2, Shapes } from "lucide-react";
import { toast } from "sonner";
import { createCategory, deleteCategory, fetchCategories, updateCategory, uploadFile } from "@/lib/api";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  display_order?: number;
  is_active?: number | boolean;
  count?: number;
};

const initialForm = {
  name: "",
  slug: "",
  icon: "",
  image: "",
  display_order: "0",
  is_active: true,
};

export default function CategoriesAdmin() {
  const [items, setItems] = useState<CategoryRow[]>([]);
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
      const data = await fetchCategories({ all: true, allowFallback: false });
      setItems(data as CategoryRow[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((item) => [item.name, item.slug, item.icon].some((value) => String(value || "").toLowerCase().includes(q)));
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

  const openEdit = (row: CategoryRow) => {
    setEditingId(row.id);
    setForm({
      name: row.name || "",
      slug: row.slug || "",
      icon: row.icon || "",
      image: row.image || "",
      display_order: String(row.display_order ?? 0),
      is_active: Boolean(row.is_active),
    });
    setImageFile(null);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Category name is required");
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
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        icon: form.icon.trim(),
        image,
        display_order: Number(form.display_order || 0),
        is_active: form.is_active,
      };
      if (editingId) {
        await updateCategory(editingId, payload);
        toast.success("Category updated");
      } else {
        await createCategory(payload);
        toast.success("Category created");
      }
      setOpen(false);
      reset();
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
      toast.success("Category deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete category");
    }
  };

  return (
    <AdminLayout title="Categories">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..." className="pl-10" />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="bg-[#2c5aa1] hover:bg-[#244a88]">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Category" : "Add Category"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} placeholder="auto-generated if empty" />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Input value={form.icon} onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))} placeholder="bed-double, accessibility, ..." />
                </div>
                <ImageUploadField
                  label="Category Image"
                  value={form.image}
                  file={imageFile}
                  onFileChange={setImageFile}
                  previewAlt={form.name || "Category preview"}
                  helperText="Pick an image file for the category thumbnail."
                />
                <div className="grid grid-cols-2 gap-3">
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
                <Button onClick={handleSave} disabled={submitting} className="w-full bg-[#2c5aa1] hover:bg-[#244a88]">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? (
                    "Update Category"
                  ) : (
                    "Create Category"
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
                Loading categories...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">No categories found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="p-4">Category</th>
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
                              <Shapes className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{row.name}</p>
                              <p className="text-xs text-muted-foreground">{row.icon || "icon"}</p>
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
