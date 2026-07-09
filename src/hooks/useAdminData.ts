import { useEffect, useState } from "react";
import { Product } from "@/data/products";
import {
  createProduct,
  deleteEnquiry,
  deleteProduct as apiDeleteProduct,
  fetchEnquiries,
  fetchProducts,
  submitEnquiry,
  updateEnquiry,
  updateProduct as apiUpdateProduct,
  type EnquiryRecord,
} from "@/lib/api";

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  equipment: string;
  message?: string;
  date: string;
  status: "pending" | "contacted" | "resolved";
}

export function useInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetchEnquiries({ page: 1, limit: 500 });
      const mapped = response.items.map((item: EnquiryRecord) => ({
        id: String(item.id),
        name: item.name,
        phone: item.phone,
        equipment: item.service_interested || "General enquiry",
        message: item.message || "",
        date: item.created_at,
        status:
          item.status === "contacted"
            ? "contacted"
            : item.status === "closed"
              ? "resolved"
              : "pending",
      }));
      setInquiries(mapped);
    } catch {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addInquiry = async (inquiry: Omit<Inquiry, "id" | "date" | "status">) => {
    await submitEnquiry({
      name: inquiry.name,
      phone: inquiry.phone,
      message: inquiry.message || inquiry.equipment,
      service_interested: inquiry.equipment,
    });
    await load();
  };

  const updateStatus = async (id: string, status: Inquiry["status"]) => {
    const apiStatus = status === "resolved" ? "closed" : status;
    await updateEnquiry(id, { status: apiStatus });
    setInquiries((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const deleteInquiry = async (id: string) => {
    await deleteEnquiry(id);
    setInquiries((prev) => prev.filter((item) => item.id !== id));
  };

  return { inquiries, loading, addInquiry, updateStatus, deleteInquiry, refresh: load };
}

export function useAdminProducts() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts({ all: true, allowFallback: false });
      setProductsList(data);
    } catch {
      setProductsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addProduct = async (product: Omit<Product, "id">) => {
    await createProduct({
      name: product.name,
      slug: product.slug,
      category: product.category,
      rent_price: product.rentPrice,
      buy_price: product.buyPrice,
      rent_unit: product.rentUnit,
      image: product.image,
      description: product.description,
      features: product.features,
      specifications: product.specs,
      benefits: product.benefits,
      is_top_selling: product.topSelling,
      display_order: product.displayOrder,
      is_active: product.available,
    });
    await load();
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const current = productsList.find((item) => item.id === id);
    const merged = current ? { ...current, ...updates } : updates;
    await apiUpdateProduct(id, {
      name: merged.name,
      slug: merged.slug,
      category: merged.category,
      rent_price: merged.rentPrice,
      buy_price: merged.buyPrice,
      rent_unit: merged.rentUnit,
      image: merged.image,
      description: merged.description,
      features: merged.features,
      specifications: merged.specs,
      benefits: merged.benefits,
      is_top_selling: merged.topSelling,
      display_order: merged.displayOrder,
      is_active: merged.available,
    });
    await load();
  };

  const deleteProduct = async (id: string) => {
    await apiDeleteProduct(id);
    setProductsList((prev) => prev.filter((item) => item.id !== id));
  };

  return { products: productsList, loading, addProduct, updateProduct, deleteProduct, refresh: load };
}

