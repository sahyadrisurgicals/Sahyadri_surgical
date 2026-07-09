import { Category, Product, products as localProducts, categories as localCategories } from "@/data/products";
export type { Category, Product };

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const ADMIN_TOKEN_KEY = "sahyadri_admin_token";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=300&fit=crop";

type RequestOptions = RequestInit & { body?: BodyInit | Record<string, unknown> | FormData | null };

export interface AdminUser {
  id: number;
  name: string;
  username: string;
  role: string;
  is_active?: number;
  last_login_at?: string | null;
}

export interface DashboardStats {
  totalServices: number;
  totalEnquiries: number;
  totalGallery: number;
  totalTestimonials: number;
  totalCategories: number;
  totalProducts: number;
  totalBlogs: number;
  totalVendors: number;
  recentEnquiries: EnquiryRecord[];
}

export interface ServiceRecord {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  image: string;
  icon: string;
  features: string[];
  display_order: number;
  is_active: number;
}

export interface GalleryRecord {
  id: number;
  title: string;
  category: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_active: number;
}

export interface TestimonialRecord {
  id: number;
  client_name: string;
  client_photo: string;
  review_text: string;
  rating: number;
  location: string;
  display_order: number;
  is_active: number;
}

export interface BlogRecord {
  id: number;
  title: string;
  slug: string;
  image: string;
  short_description: string;
  content: string;
  seo_title: string;
  meta_description: string;
  keywords: string;
  published: boolean;
  published_at: string | null;
  display_order: number;
}

export interface EnquiryRecord {
  id: number;
  name: string;
  phone: string;
  email: string;
  service_interested: string;
  message: string;
  status: "new" | "contacted" | "closed";
  admin_notes: string;
  source_page?: string;
  created_at: string;
  updated_at?: string;
}

export interface VendorRecord {
  id: number;
  vendor_name: string;
  business_name: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  gst_number: string;
  status: "pending" | "approved" | "rejected";
  admin_notes: string;
  created_at: string;
  updated_at?: string;
}

export interface ContactSettings {
  id?: number | null;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  map_iframe: string;
  business_hours: string;
  social_links: Record<string, string>;
  updated_at?: string | null;
}

export interface SeoSetting {
  id?: number;
  page_name: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  og_image: string;
  canonical_url: string;
}

export interface HomeContent {
  heroSlides: Array<Record<string, unknown>>;
  heroSlidesActive?: number;
  trustHighlights: Array<Record<string, unknown>>;
  trustHighlightsActive?: number;
  clientLogos: Array<Record<string, unknown>>;
  clientLogosActive?: number;
  homeImages: Array<Record<string, unknown>>;
  homeImagesActive?: number;
  seo?: Record<string, unknown> | null;
  seoActive?: number;
  sections?: Record<string, unknown>;
}

export interface AboutContent {
  hero?: Record<string, unknown> | null;
  overview?: Record<string, unknown> | null;
  mission?: Record<string, unknown> | null;
  vision?: Record<string, unknown> | null;
  values: Array<Record<string, unknown>>;
  counters: Array<Record<string, unknown>>;
  process: Array<string>;
  seo?: Record<string, unknown> | null;
  sections?: Record<string, unknown>;
}

export interface SiteSettings {
  [key: string]: unknown;
}

function hasWindow() {
  return typeof window !== "undefined";
}

export function getAdminToken() {
  if (!hasWindow()) return "";
  return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

export function setAdminToken(token: string) {
  if (!hasWindow()) return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  if (!hasWindow()) return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (value == null) return fallback;
  const normalized = String(value).toLowerCase().trim();
  if (["1", "true", "yes", "on", "active", "published", "enabled"].includes(normalized)) return true;
  if (["0", "false", "no", "off", "inactive", "unpublished", "disabled"].includes(normalized)) return false;
  return Boolean(value);
}

function parseArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          return String(record.title || record.label || record.name || record.text || record.value || "");
        }
        return String(item ?? "");
      })
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return parseArray(parsed);
    } catch {
      return value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function parseImageList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          return String(record.image_url || record.url || record.image || record.src || "");
        }
        return "";
      })
      .filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return parseImageList(parsed);
    } catch {
      return [value];
    }
  }
  return [];
}

function buildUrl(pathname: string) {
  const base = API_BASE_URL.replace(/\/$/, "");
  const suffix = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${suffix}`;
}

async function requestJson<T>(pathname: string, options: RequestOptions = {}, auth = false): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = auth ? getAdminToken() : "";

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body && typeof options.body === "object") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  } else if (typeof options.body === "string") {
    body = options.body;
  }

  const response = await fetch(buildUrl(pathname), {
    ...options,
    headers,
    body,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || (payload && payload.success === false)) {
    const message = payload?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }
  return payload as T;
}

export function normalizeProduct(row: Record<string, unknown>): Product {
  const name = String(row.name || row.title || "Product");
  const slug = String(row.slug || row.product_slug || row.id || slugify(name)) || slugify(name) || "product";
  const category = String(row.category ?? row.category_slug ?? row.category_name ?? "accessories");
  const images = parseImageList(row.images ?? row.product_images ?? []);
  const primaryImage = images[0] || String(row.image || row.image1 || DEFAULT_IMAGE);
  const specifications = parseArray(row.specifications ?? row.product_specifications ?? row.specifications_json);
  const features = parseArray(row.features ?? row.product_features ?? row.features_json);
  const benefits = parseArray(row.benefits ?? row.benefits_json);
  const available = parseBoolean(row.available ?? row.is_active, true);

  return {
    id: slug,
    slug,
    name,
    category,
    categoryId: toNumber(row.category_id, 0) || undefined,
    categoryName: String(row.category_name || ""),
    categoryIcon: String(row.category_icon || ""),
    rentPrice: toNumber(row.rent_price ?? row.rentPrice, 0),
    rentUnit: String(row.rent_unit ?? row.rentUnit ?? "month"),
    buyPrice: toNumber(row.buy_price ?? row.buyPrice, 0),
    image: primaryImage,
    images,
    description: String(row.description ?? "High-quality medical equipment for home care."),
    specs: specifications,
    features,
    benefits,
    specifications,
    priceType: String(row.price_type ?? row.priceType ?? "both"),
    topSelling: parseBoolean(row.is_top_selling ?? row.topSelling, false),
    displayOrder: toNumber(row.display_order ?? row.displayOrder, 0),
    available,
  };
}

export async function loginAdmin(username: string, password: string) {
  const data = await requestJson<{ token: string; admin: AdminUser }>("/admin/login", {
    method: "POST",
    body: { username, password },
  });
  setAdminToken(data.token);
  return data;
}

export async function logoutAdmin() {
  try {
    await requestJson("/admin/logout", { method: "POST" }, true);
  } catch {
    // Ignore logout failures and clear the local token either way.
  } finally {
    clearAdminToken();
  }
}

export async function getCurrentAdmin() {
  return await requestJson<AdminUser>("/admin/me", {}, true);
}

export async function changeAdminPassword(payload: { currentPassword: string; newPassword: string }) {
  return await requestJson("/admin/change-password", {
    method: "POST",
    body: payload,
  }, true);
}

export async function fetchDashboardStats() {
  return await requestJson<DashboardStats>("/dashboard/stats", {}, true);
}

export async function fetchSiteSettings() {
  return await requestJson<SiteSettings>("/site-settings");
}

export async function updateSiteSettings(payload: Record<string, unknown>) {
  return await requestJson<SiteSettings>("/site-settings", {
    method: "PUT",
    body: payload,
  }, true);
}

export async function fetchContactSettings() {
  return await requestJson<ContactSettings>("/contact-settings");
}

export async function updateContactSettings(payload: Partial<ContactSettings>) {
  return await requestJson<ContactSettings>("/contact-settings", {
    method: "PUT",
    body: payload,
  }, true);
}

export async function fetchHomeContent(options: { all?: boolean } = {}) {
  return await requestJson<HomeContent>("/home", {}, options.all || false);
}

export async function updateHomeContent(payload: Partial<HomeContent>) {
  return await requestJson<HomeContent>("/home", {
    method: "PUT",
    body: payload,
  }, true);
}

export async function fetchAboutContent() {
  return await requestJson<AboutContent>("/about");
}

export async function updateAboutContent(payload: Partial<AboutContent>) {
  return await requestJson<AboutContent>("/about", {
    method: "PUT",
    body: payload,
  }, true);
}

export async function fetchSeo(page?: string) {
  const suffix = page ? `?page=${encodeURIComponent(page)}` : "";
  return await requestJson<SeoSetting[] | SeoSetting>(`/seo${suffix}`);
}

export async function updateSeo(payload: SeoSetting | { entries: SeoSetting[] }) {
  return await requestJson<SeoSetting[] | SeoSetting>("/seo", {
    method: "PUT",
    body: payload,
  }, true);
}

export async function fetchCategories(options: { all?: boolean; allowFallback?: boolean } = {}) {
  try {
    const suffix = options.all ? "?all=1" : "";
    return await requestJson<Category[]>(`/categories${suffix}`, {}, options.all || false);
  } catch {
    if (options.allowFallback === false) throw new Error("Failed to load categories");
    return localCategories;
  }
}

export async function createCategory(payload: {
  name: string;
  slug?: string;
  icon?: string;
  image?: string;
  display_order?: number;
  is_active?: boolean | number;
}) {
  return await requestJson<Category>("/categories", { method: "POST", body: payload }, true);
}

export async function updateCategory(id: string | number, payload: Partial<Category> & { name?: string }) {
  return await requestJson<Category>(`/categories/${id}`, { method: "PUT", body: payload }, true);
}

export async function deleteCategory(id: string | number) {
  return await requestJson(`/categories/${id}`, { method: "DELETE" }, true);
}

export async function fetchServices(options: { all?: boolean; allowFallback?: boolean } = {}) {
  try {
    const suffix = options.all ? "?all=1" : "";
    return await requestJson<ServiceRecord[]>(`/services${suffix}`, {}, options.all || false);
  } catch {
    if (options.allowFallback === false) throw new Error("Failed to load services");
    return [];
  }
}

export async function createService(payload: Partial<ServiceRecord>) {
  return await requestJson<ServiceRecord>("/services", { method: "POST", body: payload }, true);
}

export async function updateService(id: string | number, payload: Partial<ServiceRecord>) {
  return await requestJson<ServiceRecord>(`/services/${id}`, { method: "PUT", body: payload }, true);
}

export async function deleteService(id: string | number) {
  return await requestJson(`/services/${id}`, { method: "DELETE" }, true);
}

export async function fetchProducts(
  options: { all?: boolean; search?: string; category?: string; topSellingOnly?: boolean; allowFallback?: boolean } = {}
) {
  const params = new URLSearchParams();
  if (options.all) params.set("all", "1");
  if (options.search) params.set("search", options.search);
  if (options.category) params.set("category", options.category);
  if (options.topSellingOnly) params.set("top_selling", "1");

  const suffix = params.toString() ? `?${params.toString()}` : "";
  try {
    const data = await requestJson<Array<Record<string, unknown>>>(`/products${suffix}`, {}, options.all || false);
    return data.map((row) => normalizeProduct(row));
  } catch {
    if (options.allowFallback === false) throw new Error("Failed to load products");
    return localProducts;
  }
}

export async function fetchProduct(identifier: string | number) {
  const data = await requestJson<Record<string, unknown>>(`/products/${identifier}`);
  return normalizeProduct(data);
}

export async function createProduct(payload: Record<string, unknown>) {
  return await requestJson<Record<string, unknown>>("/products", { method: "POST", body: payload }, true);
}

export async function updateProduct(id: string | number, payload: Record<string, unknown>) {
  return await requestJson<Record<string, unknown>>(`/products/${id}`, { method: "PUT", body: payload }, true);
}

export async function deleteProduct(id: string | number) {
  return await requestJson(`/products/${id}`, { method: "DELETE" }, true);
}

export async function fetchGallery(options: { all?: boolean; allowFallback?: boolean } = {}) {
  try {
    const suffix = options.all ? "?all=1" : "";
    return await requestJson<GalleryRecord[]>(`/gallery${suffix}`, {}, options.all || false);
  } catch {
    if (options.allowFallback === false) throw new Error("Failed to load gallery");
    return [];
  }
}

export async function createGalleryItem(payload: Partial<GalleryRecord>) {
  return await requestJson<GalleryRecord>("/gallery", { method: "POST", body: payload }, true);
}

export async function updateGalleryItem(id: string | number, payload: Partial<GalleryRecord>) {
  return await requestJson<GalleryRecord>(`/gallery/${id}`, { method: "PUT", body: payload }, true);
}

export async function deleteGalleryItem(id: string | number) {
  return await requestJson(`/gallery/${id}`, { method: "DELETE" }, true);
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return await requestJson<{ url: string; filename: string; originalName: string }>("/uploads", {
    method: "POST",
    body: formData,
  }, true);
}

export async function uploadFiles(files: FileList | File[]) {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("files", file));
  return await requestJson<Array<{ url: string; filename: string; originalName: string }>>("/uploads/multiple", {
    method: "POST",
    body: formData,
  }, true);
}

export async function fetchTestimonials(options: { all?: boolean; allowFallback?: boolean } = {}) {
  try {
    const suffix = options.all ? "?all=1" : "";
    return await requestJson<TestimonialRecord[]>(`/testimonials${suffix}`, {}, options.all || false);
  } catch {
    if (options.allowFallback === false) throw new Error("Failed to load testimonials");
    return [];
  }
}

export async function createTestimonial(payload: Partial<TestimonialRecord>) {
  return await requestJson<TestimonialRecord>("/testimonials", { method: "POST", body: payload }, true);
}

export async function updateTestimonial(id: string | number, payload: Partial<TestimonialRecord>) {
  return await requestJson<TestimonialRecord>(`/testimonials/${id}`, { method: "PUT", body: payload }, true);
}

export async function deleteTestimonial(id: string | number) {
  return await requestJson(`/testimonials/${id}`, { method: "DELETE" }, true);
}

export async function fetchBlogs(options: { all?: boolean; allowFallback?: boolean } = {}) {
  try {
    const suffix = options.all ? "?all=1" : "";
    return await requestJson<BlogRecord[]>(`/blogs${suffix}`, {}, options.all || false);
  } catch {
    if (options.allowFallback === false) throw new Error("Failed to load blogs");
    return [];
  }
}

export async function fetchBlog(identifier: string | number) {
  return await requestJson<BlogRecord>(`/blogs/${identifier}`);
}

export async function createBlog(payload: Partial<BlogRecord>) {
  return await requestJson<BlogRecord>("/blogs", { method: "POST", body: payload }, true);
}

export async function updateBlog(id: string | number, payload: Partial<BlogRecord>) {
  return await requestJson<BlogRecord>(`/blogs/${id}`, { method: "PUT", body: payload }, true);
}

export async function deleteBlog(id: string | number) {
  return await requestJson(`/blogs/${id}`, { method: "DELETE" }, true);
}

export async function submitEnquiry(payload: Record<string, unknown>) {
  return await requestJson<EnquiryRecord>("/enquiries", { method: "POST", body: payload });
}

export async function fetchEnquiries(options: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
} = {}) {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  if (options.status) params.set("status", options.status);
  if (options.search) params.set("search", options.search);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return await requestJson<{ items: EnquiryRecord[]; total: number; page: number; limit: number; pages: number }>(
    `/enquiries${suffix}`,
    {},
    true
  );
}

export async function updateEnquiry(id: string | number, payload: Partial<EnquiryRecord>) {
  return await requestJson(`/enquiries/${id}`, { method: "PUT", body: payload }, true);
}

export async function deleteEnquiry(id: string | number) {
  return await requestJson(`/enquiries/${id}`, { method: "DELETE" }, true);
}

export async function submitVendor(payload: Record<string, unknown>) {
  return await requestJson<VendorRecord>("/vendors", { method: "POST", body: payload });
}

export async function fetchVendors(options: { status?: string } = {}) {
  const params = new URLSearchParams();
  if (options.status) params.set("status", options.status);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return await requestJson<VendorRecord[]>(`/vendors${suffix}`, {}, true);
}

export async function updateVendor(id: string | number, payload: Partial<VendorRecord>) {
  return await requestJson<VendorRecord>(`/vendors/${id}`, { method: "PUT", body: payload }, true);
}

export async function deleteVendor(id: string | number) {
  return await requestJson(`/vendors/${id}`, { method: "DELETE" }, true);
}
