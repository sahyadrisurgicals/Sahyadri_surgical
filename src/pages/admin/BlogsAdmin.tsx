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
import { Loader2, Plus, Pencil, Search, Trash2, FileText, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { createBlog, deleteBlog, fetchBlogs, type BlogRecord, updateBlog, uploadFile } from "@/lib/api";

const emptyForm = {
  title: "",
  slug: "",
  image: "",
  short_description: "",
  content: "",
  seo_title: "",
  meta_description: "",
  keywords: "",
  published: true,
  display_order: "0",
};

export default function BlogsAdmin() {
  const [items, setItems] = useState<BlogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchBlogs({ all: true, allowFallback: false });
      setItems(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }
    const preview = URL.createObjectURL(imageFile);
    setImagePreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [imageFile]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((item) =>
      [item.title, item.slug, item.short_description, item.content, item.keywords].some((value) => String(value || "").toLowerCase().includes(q))
    );
  }, [items, search]);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
  };

  const openCreate = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (row: BlogRecord) => {
    setEditingId(row.id);
    setForm({
      title: row.title || "",
      slug: row.slug || "",
      image: row.image || "",
      short_description: row.short_description || "",
      content: row.content || "",
      seo_title: row.seo_title || "",
      meta_description: row.meta_description || "",
      keywords: row.keywords || "",
      published: Boolean(row.published),
      display_order: String(row.display_order ?? 0),
    });
    setImageFile(null);
    setImagePreview(row.image || "");
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Blog title is required");
      return;
    }
    setSaving(true);
    try {
      let imageUrl = form.image.trim();
      if (imageFile) {
        const uploaded = await uploadFile(imageFile);
        imageUrl = uploaded.url;
      }
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        image: imageUrl,
        short_description: form.short_description.trim(),
        content: form.content.trim(),
        seo_title: form.seo_title.trim(),
        meta_description: form.meta_description.trim(),
        keywords: form.keywords.trim(),
        published: form.published,
        display_order: Number(form.display_order || 0),
      };
      if (editingId) {
        await updateBlog(editingId, payload);
        toast.success("Blog updated");
      } else {
        await createBlog(payload);
        toast.success("Blog created");
      }
      setOpen(false);
      reset();
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save blog");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this blog post?")) return;
    try {
      await deleteBlog(id);
      toast.success("Blog deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete blog");
    }
  };

  return (
    <AdminLayout title="Blogs">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search blogs..." className="pl-10" />
          </div>
          <Dialog open={open} onOpenChange={(next) => {
            setOpen(next);
            if (!next) reset();
          }}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="bg-[#2c5aa1] hover:bg-[#244a88]">
                <Plus className="mr-2 h-4 w-4" />
                Add Blog
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Blog" : "Add Blog"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2 lg:col-span-2">
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input type="number" value={form.display_order} onChange={(event) => setForm((prev) => ({ ...prev, display_order: event.target.value }))} />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label>Cover Image</Label>
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Upload blog cover image</p>
                        <p className="text-xs text-muted-foreground">The selected file will upload when you save.</p>
                      </div>
                      <Input type="file" accept="image/*" className="max-w-xs" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
                    </div>
                    {(imagePreview || form.image) && (
                      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-white">
                        <img src={imageFile ? imagePreview : form.image || ""} alt="Blog preview" className="h-52 w-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label>Short Description</Label>
                  <Textarea value={form.short_description} onChange={(event) => setForm((prev) => ({ ...prev, short_description: event.target.value }))} className="min-h-[100px]" />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label>Full Content</Label>
                  <Textarea value={form.content} onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))} className="min-h-[170px]" />
                </div>
                <div className="space-y-2">
                  <Label>SEO Title</Label>
                  <Input value={form.seo_title} onChange={(event) => setForm((prev) => ({ ...prev, seo_title: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Input value={form.meta_description} onChange={(event) => setForm((prev) => ({ ...prev, meta_description: event.target.value }))} />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label>Keywords</Label>
                  <Input value={form.keywords} onChange={(event) => setForm((prev) => ({ ...prev, keywords: event.target.value }))} placeholder="keyword1, keyword2" />
                </div>
                <div className="flex items-end justify-between rounded-lg border border-border p-3 lg:col-span-2">
                  <div>
                    <p className="text-sm font-medium">Published</p>
                    <p className="text-xs text-muted-foreground">Show the blog on the frontend</p>
                  </div>
                  <Switch checked={form.published} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, published: checked }))} />
                </div>
                <Button onClick={handleSave} disabled={saving} className="lg:col-span-2 bg-[#2c5aa1] hover:bg-[#244a88]">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? (
                    "Update Blog"
                  ) : (
                    "Create Blog"
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
                Loading blogs...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">No blog posts found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="p-4">Blog</th>
                      <th className="p-4">Slug</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Order</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.id} className="border-b hover:bg-muted/20">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-16 overflow-hidden rounded-lg border border-border bg-muted">
                              {row.image ? (
                                <img src={row.image} alt={row.title} className="h-full w-full object-cover" />
                              ) : (
                                <FileText className="m-3 h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{row.title}</p>
                              <p className="max-w-md truncate text-xs text-muted-foreground">{row.short_description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{row.slug}</td>
                        <td className="p-4">
                          <Badge variant={row.published ? "default" : "secondary"} className={row.published ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}>
                            {row.published ? "Published" : "Draft"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{row.display_order ?? 0}</Badge>
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
