import { useState, useEffect } from "react";
import { Product } from "@/data/products";
import { createProduct, deleteProduct as apiDeleteProduct, fetchProducts, updateProduct as apiUpdateProduct } from "@/lib/api";

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  equipment: string;
  message?: string;
  date: string;
  status: "pending" | "contacted" | "resolved";
}

const INQUIRIES_KEY = "sahyadri_inquiries";
function loadInquiries(): Inquiry[] {
  try {
    const stored = localStorage.getItem(INQUIRIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveInquiries(inquiries: Inquiry[]) {
  localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
}

export function useInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(loadInquiries);

  useEffect(() => { saveInquiries(inquiries); }, [inquiries]);

  const addInquiry = (inquiry: Omit<Inquiry, "id" | "date" | "status">) => {
    const newInquiry: Inquiry = {
      ...inquiry,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      status: "pending",
    };
    setInquiries(prev => [newInquiry, ...prev]);
  };

  const updateStatus = (id: string, status: Inquiry["status"]) => {
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const deleteInquiry = (id: string) => {
    setInquiries(prev => prev.filter(i => i.id !== id));
  };

  return { inquiries, addInquiry, updateStatus, deleteInquiry };
}

export function useAdminProducts() {
  const [productList, setProductList] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchProducts();
        if (active) setProductList(data);
      } catch {
        if (active) setProductList([]);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const addProduct = async (product: Omit<Product, "id">) => {
    const payload = {
      name: product.name,
      category_id: product.category,
      rent_price: product.rentPrice,
      buy_price: product.buyPrice,
      description: product.description,
      image1: product.image,
      is_active: product.available ? 1 : 0,
    };
    const result = await createProduct(payload);
    const id = String(result.insertId ?? product.name);
    setProductList(prev => [{ ...product, id }, ...prev]);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const current = productList.find(p => p.id === id);
    if (!current) return;
    const merged = { ...current, ...updates };
    await apiUpdateProduct(id, {
      name: merged.name,
      category_id: merged.category,
      rent_price: merged.rentPrice,
      buy_price: merged.buyPrice,
      description: merged.description,
      image1: merged.image,
      is_active: merged.available ? 1 : 0,
    });
    setProductList(prev => prev.map(p => (p.id === id ? merged : p)));
  };

  const deleteProduct = async (id: string) => {
    await apiDeleteProduct(id);
    setProductList(prev => prev.filter(p => p.id !== id));
  };

  return { products: productList, addProduct, updateProduct, deleteProduct };
}
