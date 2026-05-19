import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminProducts } from "@/hooks/useAdminData";
import { categories } from "@/data/products";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ProductsAdmin() {
  const { products, addProduct, updateProduct, deleteProduct } = useAdminProducts();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", category: "", rentPrice: "", rentUnit: "month",
    buyPrice: "", image: "", description: "", available: true,
  });

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ name: "", category: "", rentPrice: "", rentUnit: "month", buyPrice: "", image: "", description: "", available: true });
    setEditingId(null);
  };

  const openEdit = (id: string) => {
    const p = products.find(p => p.id === id);
    if (!p) return;
    setForm({
      name: p.name, category: p.category, rentPrice: String(p.rentPrice),
      rentUnit: p.rentUnit, buyPrice: String(p.buyPrice), image: p.image,
      description: p.description, available: p.available,
    });
    setEditingId(id);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.rentPrice || !form.buyPrice) {
      toast.error("Please fill all required fields");
      return;
    }
    const data = {
      name: form.name, category: form.category,
      rentPrice: Number(form.rentPrice), rentUnit: form.rentUnit,
      buyPrice: Number(form.buyPrice), image: form.image || "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=300&fit=crop",
      description: form.description, specs: [], features: [], available: form.available,
    };
    try {
      if (editingId) {
        await updateProduct(editingId, data);
        toast.success("Product updated");
      } else {
        await addProduct(data);
        toast.success("Product added");
      }
      resetForm();
      setDialogOpen(false);
    } catch {
      toast.error("Unable to save product");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
    } catch {
      toast.error("Unable to delete product");
    }
  };

  return (
    <AdminLayout title="Products">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-cta text-primary-foreground">
                <Plus className="h-4 w-4 mr-1" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Rent Price (₹) *</Label>
                    <Input type="number" value={form.rentPrice} onChange={e => setForm(f => ({ ...f, rentPrice: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Buy Price (₹) *</Label>
                    <Input type="number" value={form.buyPrice} onChange={e => setForm(f => ({ ...f, buyPrice: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                </div>
                <Button onClick={handleSubmit} className="w-full gradient-hero text-primary-foreground">
                  {editingId ? "Update Product" : "Add Product"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="card-shadow">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Rent</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Buy</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(product => (
                    <tr key={product.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                          <span className="font-medium text-foreground">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-muted-foreground">
                        {categories.find(c => c.id === product.category)?.name || product.category}
                      </td>
                      <td className="p-4 text-foreground">₹{product.rentPrice}/{product.rentUnit}</td>
                      <td className="p-4 hidden sm:table-cell text-foreground">₹{product.buyPrice.toLocaleString()}</td>
                      <td className="p-4">
                        <Badge variant={product.available ? "default" : "secondary"} className={product.available ? "bg-trust/10 text-trust border-trust/20" : ""}>
                          {product.available ? "Available" : "Unavailable"}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(product.id)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No products found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
