import { Product } from "@/data/products";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=300&fit=crop";

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v));
    } catch {
      return value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
  }
  return [];
}

export function normalizeProduct(row: Record<string, unknown>): Product {
  const name = String(row.name || "Product");
  const rawId = row.id ?? row.product_id ?? row.slug ?? row.code;
  const id = rawId != null ? String(rawId) : slugify(name) || "product";
  const category = String(row.category ?? row.category_id ?? "accessories");
  const rentPrice = toNumber(row.rent_price ?? row.rentPrice);
  const buyPrice = toNumber(row.buy_price ?? row.buyPrice);
  const rentUnit = String(row.rent_unit ?? row.rentUnit ?? "month");
  const image = String(row.image ?? row.image1 ?? DEFAULT_IMAGE);
  const description = String(
    row.description ?? "High-quality medical equipment for home care."
  );
  const specs = parseStringArray(row.specs ?? row.specifications);
  const features = parseStringArray(row.features);
  const available =
    typeof row.available === "boolean"
      ? row.available
      : row.available == null
        ? true
        : Boolean(row.available);

  return {
    id,
    name,
    category,
    rentPrice,
    rentUnit,
    buyPrice,
    image,
    description,
    specs,
    features,
    available,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/products`);
  if (!res.ok) {
    throw new Error(`Failed to fetch products (${res.status})`);
  }
  const data = await res.json();
  const list = Array.isArray(data) ? data : [];
  return list.map((row) => normalizeProduct(row as Record<string, unknown>));
}

export async function createProduct(payload: {
  name: string;
  category_id: string;
  rent_price: number;
  buy_price: number;
  description?: string;
  image1?: string;
  is_active?: number | boolean;
}) {
  const res = await fetch(`${API_BASE_URL}/add-product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to add product (${res.status})`);
  }
  return await res.json();
}

export async function updateProduct(
  id: string,
  payload: {
    name: string;
    category_id: string;
    rent_price: number;
    buy_price: number;
    description?: string;
    image1?: string;
    is_active?: number | boolean;
  }
) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to update product (${res.status})`);
  }
  return await res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete product (${res.status})`);
  }
  return await res.json();
}

export async function createEnquiry(payload: {
  name: string;
  phone: string;
  message: string;
}) {
  const res = await fetch(`${API_BASE_URL}/enquiry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to send enquiry (${res.status})`);
  }
  try {
    return await res.json();
  } catch {
    return { success: true };
  }
}
