import { useState, useEffect } from "react";
import { products as initialProducts, Product } from "@/data/products";

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
const PRODUCTS_KEY = "sahyadri_products";

function loadInquiries(): Inquiry[] {
  try {
    const stored = localStorage.getItem(INQUIRIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveInquiries(inquiries: Inquiry[]) {
  localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
}

function loadProducts(): Product[] {
  try {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    return stored ? JSON.parse(stored) : initialProducts;
  } catch { return initialProducts; }
}

function saveProducts(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
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
  const [productList, setProductList] = useState<Product[]>(loadProducts);

  useEffect(() => { saveProducts(productList); }, [productList]);

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = { ...product, id: crypto.randomUUID() };
    setProductList(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProductList(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProductList(prev => prev.filter(p => p.id !== id));
  };

  return { products: productList, addProduct, updateProduct, deleteProduct };
}
