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
import { Loader2, Plus, Pencil, Search, Trash2, Images, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import {
  createGalleryItem,
  deleteGalleryItem,
  fetchGallery,
  type GalleryRecord,
  updateGalleryItem,
  uploadFiles,
} from "@/lib/api";

const emptyForm = {
  title: "",
  category: "",
  image_url: "",
  alt_text: "",
  display_order: "0",
  is_active: true,
};

export default function GalleryAdmin() {
  const [items, setItems] = useState<GalleryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchGallery({ all: true, allowFallback: false });
      setItems(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const nextPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(nextPreviews);
    return () => nextPreviews.forEach((preview) => URL.revokeObjectURL(preview));
  }, [files]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((item) =>
      [item.title, item.category, item.alt_text, item.image_url].some((value) => String(value || "").toLowerCase().includes(q))
    );
  }, [items, search]);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFiles([]);
    setPreviews([]);
  };

  const openCreate = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (row: GalleryRecord) => {
    setEditingId(row.id);
    setForm({
      title: row.title || "",
      category: row.category || "",
      image_url: row.image_url || "",
      alt_text: row.alt_text || "",
      display_order: String(row.display_order ?? 0),
      is_active: Boolean(row.is_active),
    });
    setFiles([]);
    setPreviews([]);
    setOpen(true);
  };

  const saveSingle = async (payload: {
    title: string;
    category: string;
    image_url: string;
    alt_text: string;
    display_order: number;
    is_active: boolean;
  }) => {
    if (editingId) {
      await updateGalleryItem(editingId, payload);
      toast.success("Gallery item updated");
    } else {
      await createGalleryItem(payload);
      toast.success("Gallery item created");
    }
  };

  const handleSave = async () => {
    const title = form.title.trim() || "Gallery Image";
    const category = form.category.trim();
    const altText = form.alt_text.trim() || title;

    if (!form.image_url.trim() && files.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setSaving(true);
    try {
      if (!editingId && files.length > 1) {
        const uploaded = await uploadFiles(files);
        for (let index = 0; index < uploaded.length; index += 1) {
          await createGalleryItem({
            title: files.length > 1 ? `${title} ${index + 1}` : title,
            category,
            image_url: uploaded[index].url,
            alt_text: altText,
            display_order: Number(form.display_order || 0) + index,
            is_active: form.is_active,
          });
        }
        toast.success("Gallery images uploaded");
      } else {
        let imageUrl = form.image_url.trim();
        if (files.length) {
          const uploaded = await uploadFiles(files);
          imageUrl = uploaded[0]?.url || imageUrl;
        }
        await saveSingle({
          title,
          category,
          image_url: imageUrl,
          alt_text: altText,
          display_order: Number(form.display_order || 0),
          is_active: form.is_active,
        });
      }

      setOpen(false);
      reset();
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save gallery item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this gallery image?")) return;
    try {
      await deleteGalleryItem(id);
      toast.success("Gallery item deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete gallery item");
    }
  };

  return (
    <AdminLayout title="Gallery">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search gallery..." className="pl-10" />
          </div>
          <Dialog open={open} onOpenChange={(next) => {
            setOpen(next);
            if (!next) reset();
          }}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="bg-[#2c5aa1] hover:bg-[#244a88]">
                <Plus className="mr-2 h-4 w-4" />
                Add Gallery Image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Gallery Image" : "Add Gallery Image"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input type="number" value={form.display_order} onChange={(event) => setForm((prev) => ({ ...prev, display_order: event.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Upload Images</Label>
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Select one or more image files</p>
                        <p className="text-xs text-muted-foreground">Multiple files will create multiple gallery entries when adding new items.</p>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        className="max-w-xs"
                        onChange={(event) => setFiles(Array.from(event.target.files || []))}
                      />
                    </div>
                    {previews.length > 0 && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {previews.map((preview, index) => (
                          <div key={`${preview}-${index}`} className="overflow-hidden rounded-lg border border-border bg-white">
                            <img src={preview} alt={`Preview ${index + 1}`} className="h-40 w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Alt Text</Label>
                  <Textarea value={form.alt_text} onChange={(event) => setForm((prev) => ({ ...prev, alt_text: event.target.value }))} />
                </div>
                <div className="flex items-end justify-between rounded-lg border border-border p-3 md:col-span-2">
                  <div>
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-xs text-muted-foreground">Show image on the frontend</p>
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
                    "Update Gallery Item"
                  ) : (
                    "Create Gallery Item"
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
                Loading gallery...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">No gallery images found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="p-4">Image</th>
                      <th className="p-4">Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.id} className="border-b hover:bg-muted/20">
                        <td className="p-4">
                          <div className="h-16 w-24 overflow-hidden rounded-lg border border-border bg-muted">
                            {row.image_url ? <img src={row.image_url} alt={row.alt_text || row.title} className="h-full w-full object-cover" /> : <Images className="m-4 h-6 w-6 text-muted-foreground" />}
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-foreground">{row.title}</p>
                          <p className="text-xs text-muted-foreground">{row.alt_text}</p>
                        </td>
                        <td className="p-4 text-muted-foreground">{row.category || "-"}</td>
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
