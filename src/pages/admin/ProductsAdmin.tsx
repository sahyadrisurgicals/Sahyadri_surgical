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
import { Plus, Pencil, Trash2, Search, Loader2, Package, UploadCloud, Image as ImageIcon, Star } from "lucide-react";
import { toast } from "sonner";
import {
  createProduct,
  deleteProduct,
  fetchCategories,
  fetchProducts,
  type Category,
  type Product,
  updateProduct,
  uploadFile,
  uploadFiles,
} from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fallbackImage = "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=300&fit=crop";

const emptyForm = {
  name: "",
  slug: "",
  category: "",
  rent_price: "",
  buy_price: "",
  rent_unit: "month",
  price_type: "both",
  image: "",
  imagesText: "",
  description: "",
  featuresText: "",
  specificationsText: "",
  benefitsText: "",
  relatedProductsText: "",
  display_order: "0",
  is_top_selling: false,
  is_active: true,
};

function parseLines(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueStrings(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

export default function ProductsAdmin() {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [primaryPreview, setPrimaryPreview] = useState("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([
        fetchProducts({ all: true, allowFallback: false }),
        fetchCategories({ all: true, allowFallback: false }),
      ]);
      setItems(productData);
      setCategories(categoryData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!primaryFile) {
      setPrimaryPreview("");
      return;
    }
    const preview = URL.createObjectURL(primaryFile);
    setPrimaryPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [primaryFile]);

  useEffect(() => {
    const previews = galleryFiles.map((file) => URL.createObjectURL(file));
    setGalleryPreviews(previews);
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview));
  }, [galleryFiles]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((item) =>
      [
        item.name,
        item.slug,
        item.category,
        item.categoryName,
        item.description,
        item.features?.join(" "),
        item.specifications?.join(" "),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [items, search]);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setPrimaryFile(null);
    setPrimaryPreview("");
    setGalleryFiles([]);
    setGalleryPreviews([]);
  };

  const openCreate = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (row: Product) => {
    setEditingId(row.id);
    setForm({
      name: row.name || "",
      slug: row.slug || "",
      category: row.category || "",
      rent_price: String(row.rentPrice ?? ""),
      buy_price: String(row.buyPrice ?? ""),
      rent_unit: row.rentUnit || "month",
      price_type: row.priceType || "both",
      image: row.image || "",
      imagesText: (row.images || []).slice(1).join("\n"),
      description: row.description || "",
      featuresText: (row.features || []).join("\n"),
      specificationsText: (row.specifications || row.specs || []).join("\n"),
      benefitsText: (row.benefits || []).join("\n"),
      relatedProductsText: "",
      display_order: String(row.displayOrder ?? 0),
      is_top_selling: Boolean(row.topSelling),
      is_active: Boolean(row.available),
    });
    setPrimaryFile(null);
    setPrimaryPreview(row.image || "");
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.category.trim()) {
      toast.error("Product name and category are required");
      return;
    }

    setSaving(true);
    try {
      let mainImage = form.image.trim() || fallbackImage;
      if (primaryFile) {
        const uploaded = await uploadFile(primaryFile);
        mainImage = uploaded.url;
      }

      const extraImages = parseLines(form.imagesText);
      if (galleryFiles.length) {
        const uploaded = await uploadFiles(galleryFiles);
        extraImages.push(...uploaded.map((item) => item.url));
      }

      const images = uniqueStrings([mainImage, ...extraImages]);
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        category: form.category.trim(),
        rent_price: form.rent_price ? Number(form.rent_price) : null,
        buy_price: form.buy_price ? Number(form.buy_price) : null,
        rent_unit: form.rent_unit,
        price_type: form.price_type,
        image: mainImage,
        images,
        description: form.description.trim(),
        features: parseLines(form.featuresText),
        specifications: parseLines(form.specificationsText),
        benefits: parseLines(form.benefitsText),
        related_products: parseLines(form.relatedProductsText),
        display_order: Number(form.display_order || 0),
        is_top_selling: form.is_top_selling,
        is_active: form.is_active,
      };

      if (editingId) {
        await updateProduct(editingId, payload);
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product created");
      }

      setOpen(false);
      reset();
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete product");
    }
  };

  const categoryLabel = (slug: string) => categories.find((item) => item.slug === slug)?.name || slug || "Unassigned";

  return (
    <AdminLayout title="Products">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." className="pl-10" />
          </div>
          <Dialog open={open} onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (!nextOpen) reset();
          }}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="bg-[#2c5aa1] hover:bg-[#244a88]">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2 lg:col-span-2">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug || category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:col-span-2">
                  <div className="space-y-2">
                    <Label>Rent Price</Label>
                    <Input type="number" value={form.rent_price} onChange={(event) => setForm((prev) => ({ ...prev, rent_price: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Buy Price</Label>
                    <Input type="number" value={form.buy_price} onChange={(event) => setForm((prev) => ({ ...prev, buy_price: event.target.value }))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Price Type</Label>
                  <Select value={form.price_type} onValueChange={(value) => setForm((prev) => ({ ...prev, price_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Rent + Buy</SelectItem>
                      <SelectItem value="rent">Rent Only</SelectItem>
                      <SelectItem value="buy">Buy Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rent Unit</Label>
                  <Input value={form.rent_unit} onChange={(event) => setForm((prev) => ({ ...prev, rent_unit: event.target.value }))} />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <Label>Main Image</Label>
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Upload a primary image</p>
                        <p className="text-xs text-muted-foreground">A selected file will replace the current image on save.</p>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        className="max-w-xs"
                        onChange={(event) => setPrimaryFile(event.target.files?.[0] || null)}
                      />
                    </div>
                    {(primaryPreview || form.image) && (
                      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-white">
                        <img
                          src={primaryFile ? primaryPreview : form.image || fallbackImage}
                          alt="Product preview"
                          className="h-48 w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <Label>Additional Images</Label>
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Upload extra images</p>
                        <p className="text-xs text-muted-foreground">Selected files will be uploaded and attached to the product.</p>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        className="max-w-xs"
                        onChange={(event) => setGalleryFiles(Array.from(event.target.files || []))}
                      />
                    </div>
                    {galleryPreviews.length > 0 && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
                        {galleryPreviews.map((preview, index) => (
                          <div key={`${preview}-${index}`} className="overflow-hidden rounded-lg border border-border bg-white">
                            <img src={preview} alt={`Extra preview ${index + 1}`} className="h-28 w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    {parseLines(form.imagesText).length > 0 && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
                        {parseLines(form.imagesText).map((src, index) => (
                          <div key={`${src}-${index}`} className="overflow-hidden rounded-lg border border-border bg-white">
                            <img src={src} alt={`Existing product image ${index + 1}`} className="h-28 w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} className="min-h-[130px]" />
                </div>

                <div className="grid gap-4 lg:col-span-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Features</Label>
                    <Textarea value={form.featuresText} onChange={(event) => setForm((prev) => ({ ...prev, featuresText: event.target.value }))} className="min-h-[130px]" placeholder="One feature per line" />
                  </div>
                  <div className="space-y-2">
                    <Label>Specifications</Label>
                    <Textarea value={form.specificationsText} onChange={(event) => setForm((prev) => ({ ...prev, specificationsText: event.target.value }))} className="min-h-[130px]" placeholder="One specification per line" />
                  </div>
                  <div className="space-y-2">
                    <Label>Benefits</Label>
                    <Textarea value={form.benefitsText} onChange={(event) => setForm((prev) => ({ ...prev, benefitsText: event.target.value }))} className="min-h-[130px]" placeholder="One benefit per line" />
                  </div>
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <Label>Related Products</Label>
                  <Textarea value={form.relatedProductsText} onChange={(event) => setForm((prev) => ({ ...prev, relatedProductsText: event.target.value }))} className="min-h-[90px]" placeholder="One related product slug per line" />
                </div>

                <div className="grid gap-3 lg:col-span-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Display Order</Label>
                    <Input type="number" value={form.display_order} onChange={(event) => setForm((prev) => ({ ...prev, display_order: event.target.value }))} />
                  </div>
                  <div className="flex items-end justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">Top Selling</p>
                      <p className="text-xs text-muted-foreground">Highlight on the homepage</p>
                    </div>
                    <Switch checked={form.is_top_selling} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_top_selling: checked }))} />
                  </div>
                  <div className="flex items-end justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">Active</p>
                      <p className="text-xs text-muted-foreground">Show on frontend</p>
                    </div>
                    <Switch checked={form.is_active} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))} />
                  </div>
                </div>

                <Button onClick={handleSave} disabled={saving} className="lg:col-span-2 bg-[#2c5aa1] hover:bg-[#244a88]">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? (
                    "Update Product"
                  ) : (
                    "Create Product"
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
                Loading products...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">No products found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="p-4">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Flags</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.id} className="border-b hover:bg-muted/20">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                              {row.image ? (
                                <img src={row.image} alt={row.name} className="h-full w-full object-cover" />
                              ) : (
                                <Package className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{row.name}</p>
                              <p className="max-w-md truncate text-xs text-muted-foreground">{row.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{categoryLabel(row.category || "")}</td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="text-foreground">Rent: {row.rentPrice ? `₹${Number(row.rentPrice).toLocaleString("en-IN")}/${row.rentUnit || "month"}` : "-"}</p>
                            <p className="text-muted-foreground">Buy: {row.buyPrice ? `₹${Number(row.buyPrice).toLocaleString("en-IN")}` : "-"}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            {row.topSelling ? (
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                <Star className="mr-1 h-3 w-3" />
                                Top Selling
                              </Badge>
                            ) : null}
                            <Badge variant={row.available ? "default" : "secondary"} className={row.available ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}>
                              {row.available ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{row.displayOrder ?? 0}</Badge>
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
