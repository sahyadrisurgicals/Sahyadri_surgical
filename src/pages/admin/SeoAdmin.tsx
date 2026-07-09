import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Search, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { fetchSeo, updateSeo, type SeoSetting, uploadFile } from "@/lib/api";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

const emptyForm: SeoSetting = {
  page_name: "",
  meta_title: "",
  meta_description: "",
  keywords: "",
  og_image: "",
  canonical_url: "",
};

export default function SeoAdmin() {
  const [items, setItems] = useState<SeoSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SeoSetting>(emptyForm);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchSeo();
      setItems(Array.isArray(data) ? data : [data]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load SEO settings");
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
      [item.page_name, item.meta_title, item.meta_description, item.keywords, item.canonical_url].some((value) => String(value || "").toLowerCase().includes(q))
    );
  }, [items, search]);

  const reset = () => {
    setForm(emptyForm);
    setOgImageFile(null);
  };

  const openCreate = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (row: SeoSetting) => {
    setForm({
      page_name: row.page_name || "",
      meta_title: row.meta_title || "",
      meta_description: row.meta_description || "",
      keywords: row.keywords || "",
      og_image: row.og_image || "",
      canonical_url: row.canonical_url || "",
    });
    setOgImageFile(null);
    setOpen(true);
  };

  const handleDelete = async (pageName: string) => {
    if (!window.confirm(`Delete SEO settings for "${pageName}"?`)) return;
    try {
      await updateSeo({
        page_name: pageName,
        meta_title: "",
        meta_description: "",
        keywords: "",
        og_image: "",
        canonical_url: "",
      });
      toast.success("SEO settings cleared");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to clear SEO settings");
    }
  };

  const handleSave = async () => {
    if (!form.page_name.trim()) {
      toast.error("Page name is required");
      return;
    }
    setSaving(true);
    try {
      let ogImage = form.og_image.trim();
      if (ogImageFile) {
        const uploaded = await uploadFile(ogImageFile);
        ogImage = uploaded.url;
      }

      await updateSeo({
        page_name: form.page_name.trim(),
        meta_title: form.meta_title.trim(),
        meta_description: form.meta_description.trim(),
        keywords: form.keywords.trim(),
        og_image: ogImage,
        canonical_url: form.canonical_url.trim(),
      });
      toast.success("SEO settings saved");
      setOpen(false);
      reset();
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save SEO settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="SEO">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search SEO pages..." className="pl-10" />
          </div>

          <Dialog open={open} onOpenChange={(next) => {
            setOpen(next);
            if (!next) reset();
          }}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="bg-[#2c5aa1] hover:bg-[#244a88]">
                <Plus className="mr-2 h-4 w-4" />
                Add SEO Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{form.page_name ? `SEO: ${form.page_name}` : "Add SEO Entry"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Page Name *</Label>
                  <Input value={form.page_name} onChange={(event) => setForm((prev) => ({ ...prev, page_name: event.target.value }))} placeholder="home, about, contact..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Meta Title</Label>
                  <Input value={form.meta_title} onChange={(event) => setForm((prev) => ({ ...prev, meta_title: event.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Meta Description</Label>
                  <Textarea value={form.meta_description} onChange={(event) => setForm((prev) => ({ ...prev, meta_description: event.target.value }))} className="min-h-[110px]" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Keywords</Label>
                  <Input value={form.keywords} onChange={(event) => setForm((prev) => ({ ...prev, keywords: event.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <ImageUploadField
                    label="OG Image"
                    value={form.og_image}
                    file={ogImageFile}
                    onFileChange={setOgImageFile}
                    previewAlt={form.page_name || "SEO preview"}
                    helperText="Upload the social sharing image for this page."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Canonical URL</Label>
                  <Input value={form.canonical_url} onChange={(event) => setForm((prev) => ({ ...prev, canonical_url: event.target.value }))} />
                </div>
                <Button onClick={handleSave} disabled={saving} className="md:col-span-2 bg-[#2c5aa1] hover:bg-[#244a88]">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save SEO Entry
                    </>
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
                Loading SEO settings...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">No SEO entries found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="p-4">Page</th>
                      <th className="p-4">Meta Title</th>
                      <th className="p-4">Canonical URL</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.page_name} className="border-b hover:bg-muted/20">
                        <td className="p-4">
                          <Badge variant="outline">{row.page_name}</Badge>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-foreground">{row.meta_title}</p>
                          <p className="max-w-lg truncate text-xs text-muted-foreground">{row.meta_description}</p>
                        </td>
                        <td className="p-4 text-muted-foreground">{row.canonical_url}</td>
                        <td className="p-4">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(row.page_name)}>
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
