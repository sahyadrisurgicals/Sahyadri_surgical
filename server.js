import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  createSlug,
  execute,
  initializeDatabase,
  parseJson,
  query,
  stringifyJson,
  getPool,
} from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || "sahyadri-surgical-secret";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
app.set("trust proxy", 1);

app.use(
  cors({
    origin: FRONTEND_ORIGIN === "*" ? true : FRONTEND_ORIGIN.split(",").map((value) => value.trim()),
    credentials: true,
  })
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDir));

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again later." },
});

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    cb(null, `${Date.now()}-${baseName || "upload"}${extension}`);
  },
});

const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedImageMimeTypes.has(file.mimetype)) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function sendSuccess(res, data = null, message = "Success") {
  return res.json({ success: true, message, data });
}

function sendError(res, status, message, details = null) {
  return res.status(status).json({ success: false, message, details });
}

function parseArray(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return fallback;
}

function parseObject(value, fallback = {}) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function toBoolean(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback ? 1 : 0;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number") return value ? 1 : 0;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on", "active", "published", "enabled"].includes(normalized)) return 1;
  if (["0", "false", "no", "off", "inactive", "unpublished", "disabled"].includes(normalized)) return 0;
  return value ? 1 : 0;
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeIdentifier(value) {
  return String(value ?? "").trim();
}

function isNumericIdentifier(value) {
  return /^\d+$/.test(normalizeIdentifier(value));
}

async function findRowByIdentifier(table, identifier) {
  const normalized = normalizeIdentifier(identifier);
  if (!normalized) return null;

  if (isNumericIdentifier(normalized)) {
    const numericRows = await query(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [Number(normalized)]);
    if (numericRows[0]) return numericRows[0];
  }

  const rows = await query(`SELECT * FROM ${table} WHERE slug = ? LIMIT 1`, [normalized]);
  return rows[0] || null;
}

async function deleteRowByIdentifier(table, identifier) {
  const normalized = normalizeIdentifier(identifier);
  if (!normalized) return { affectedRows: 0 };

  if (isNumericIdentifier(normalized)) {
    const result = await execute(`DELETE FROM ${table} WHERE id = ?`, [Number(normalized)]);
    if (result?.affectedRows) return result;
  }

  return await execute(`DELETE FROM ${table} WHERE slug = ?`, [normalized]);
}

async function findProductByIdentifier(identifier) {
  const normalized = normalizeIdentifier(identifier);
  if (!normalized) return null;

  if (isNumericIdentifier(normalized)) {
    const numericRows = await query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?
       LIMIT 1`,
      [Number(normalized)]
    );
    if (numericRows[0]) return numericRows[0];
  }

  const rows = await query(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.slug = ?
     LIMIT 1`,
    [normalized]
  );
  return rows[0] || null;
}

async function findCategoryIdByIdentifier(connection, identifier) {
  const normalized = normalizeIdentifier(identifier);
  if (!normalized) return null;

  if (isNumericIdentifier(normalized)) {
    const [numericRows] = await connection.query("SELECT id FROM categories WHERE id = ? LIMIT 1", [Number(normalized)]);
    if (numericRows[0]) return numericRows[0].id;
  }

  const [rows] = await connection.query("SELECT id FROM categories WHERE slug = ? LIMIT 1", [normalized]);
  return rows[0] ? rows[0].id : null;
}

function getAuthToken(req) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token.trim();
}

function optionalAuth(req, _res, next) {
  const token = getAuthToken(req);
  if (!token) return next();
  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch {
    req.user = null;
  }
  return next();
}

function requireAuth(req, res, next) {
  const token = getAuthToken(req);
  if (!token) {
    return sendError(res, 401, "Authorization token is required");
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return sendError(res, 401, "Invalid or expired token");
  }
}

function sanitizeAdmin(row) {
  if (!row) return null;
  const { password_hash, ...rest } = row;
  return rest;
}

async function getAdminByUsername(username) {
  const rows = await query("SELECT * FROM admins WHERE username = ? LIMIT 1", [username]);
  return rows[0] || null;
}

async function getAdminById(id) {
  const rows = await query("SELECT * FROM admins WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

async function upsertSection(tableName, sectionKey, sectionLabel, content, isActive = 1) {
  await execute(
    `INSERT INTO ${tableName} (section_key, section_label, content_json, is_active)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE section_label = VALUES(section_label), content_json = VALUES(content_json), is_active = VALUES(is_active)`,
    [sectionKey, sectionLabel, stringifyJson(content), toBoolean(isActive, 1)]
  );
}

async function upsertSetting(settingKey, settingValue) {
  await execute(
    `INSERT INTO site_settings (setting_key, setting_value)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [settingKey, typeof settingValue === "string" ? settingValue : stringifyJson(settingValue)]
  );
}

async function loadSiteSettings() {
  const rows = await query("SELECT setting_key, setting_value FROM site_settings ORDER BY setting_key ASC");
  const result = {};
  for (const row of rows) {
    const parsed = parseJson(row.setting_value, row.setting_value);
    result[row.setting_key] = parsed;
  }
  return result;
}

async function loadContactSettings() {
  const rows = await query("SELECT * FROM contact_settings ORDER BY id ASC LIMIT 1");
  const row = rows[0] || {};
  return {
    id: row.id || null,
    phone: row.phone || "",
    whatsapp: row.whatsapp || "",
    email: row.email || "",
    address: row.address || "",
    map_iframe: row.map_iframe || "",
    business_hours: row.business_hours || "",
    social_links: parseJson(row.social_links_json, {
      facebook: "",
      instagram: "",
      linkedin: "",
      youtube: "",
    }),
    updated_at: row.updated_at || null,
  };
}

async function saveContactSettings(payload) {
  const current = await query("SELECT id FROM contact_settings ORDER BY id ASC LIMIT 1");
  const row = current[0];
  const values = [
    payload.phone || "",
    payload.whatsapp || "",
    payload.email || "",
    payload.address || "",
    payload.map_iframe || "",
    payload.business_hours || "",
    stringifyJson(payload.social_links || {}),
  ];

  if (row) {
    await execute(
      `UPDATE contact_settings
       SET phone = ?, whatsapp = ?, email = ?, address = ?, map_iframe = ?, business_hours = ?, social_links_json = ?
       WHERE id = ?`,
      [...values, row.id]
    );
    return row.id;
  }

  const result = await execute(
    `INSERT INTO contact_settings (phone, whatsapp, email, address, map_iframe, business_hours, social_links_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    values
  );
  return result.insertId;
}

async function buildCategories(includeInactive = false) {
  const rows = await query("SELECT * FROM categories ORDER BY display_order ASC, id ASC");
  const productCounts = await query(
    "SELECT category_id, COUNT(*) AS count FROM products WHERE is_active = 1 GROUP BY category_id"
  );
  const countMap = new Map(productCounts.map((item) => [Number(item.category_id), Number(item.count)]));
  return rows
    .filter((row) => includeInactive || Number(row.is_active) === 1)
    .map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      icon: row.icon,
      image: row.image,
      display_order: row.display_order,
      is_active: Number(row.is_active),
      count: countMap.get(Number(row.id)) || 0,
    }));
}

async function buildServices(includeInactive = false) {
  const rows = await query("SELECT * FROM services ORDER BY display_order ASC, id ASC");
  return rows
    .filter((row) => includeInactive || Number(row.is_active) === 1)
    .map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      short_description: row.short_description || "",
      full_description: row.full_description || "",
      image: row.image || "",
      icon: row.icon || "",
      features: parseArray(row.features_json, []),
      display_order: row.display_order,
      is_active: Number(row.is_active),
    }));
}

async function buildProducts(includeInactive = false, filters = {}) {
  const rows = await query(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ORDER BY p.display_order ASC, p.id DESC`
  );

  let filtered = rows;
  if (!includeInactive) {
    filtered = filtered.filter((row) => Number(row.is_active) === 1);
  }
  if (filters.topSellingOnly) {
    filtered = filtered.filter((row) => Number(row.is_top_selling) === 1);
  }
  if (filters.search) {
    const search = String(filters.search).toLowerCase();
    filtered = filtered.filter((row) => {
      return (
        String(row.name || "").toLowerCase().includes(search) ||
        String(row.slug || "").toLowerCase().includes(search) ||
        String(row.category_name || "").toLowerCase().includes(search) ||
        String(row.category_slug || "").toLowerCase().includes(search)
      );
    });
  }
  if (filters.category) {
    filtered = filtered.filter(
      (row) => String(row.category_slug || "") === String(filters.category) || String(row.category_id) === String(filters.category)
    );
  }

  const ids = filtered.map((row) => row.id);
  const [imagesRows, featureRows, specRows] = ids.length
    ? await Promise.all([
        query(`SELECT * FROM product_images WHERE product_id IN (${ids.map(() => "?").join(",")}) ORDER BY display_order ASC, id ASC`, ids),
        query(`SELECT * FROM product_features WHERE product_id IN (${ids.map(() => "?").join(",")}) ORDER BY display_order ASC, id ASC`, ids),
        query(`SELECT * FROM product_specifications WHERE product_id IN (${ids.map(() => "?").join(",")}) ORDER BY display_order ASC, id ASC`, ids),
      ])
    : [[], [], []];

  const imagesMap = new Map();
  for (const row of imagesRows) {
    if (!imagesMap.has(row.product_id)) imagesMap.set(row.product_id, []);
    imagesMap.get(row.product_id).push({
      id: row.id,
      image_url: row.image_url,
      alt_text: row.alt_text,
      display_order: row.display_order,
      is_active: Number(row.is_active),
    });
  }

  const featureMap = new Map();
  for (const row of featureRows) {
    if (!featureMap.has(row.product_id)) featureMap.set(row.product_id, []);
    featureMap.get(row.product_id).push({
      id: row.id,
      title: row.title,
      description: row.description,
      display_order: row.display_order,
      is_active: Number(row.is_active),
    });
  }

  const specMap = new Map();
  for (const row of specRows) {
    if (!specMap.has(row.product_id)) specMap.set(row.product_id, []);
    specMap.get(row.product_id).push({
      id: row.id,
      label: row.label,
      value: row.value,
      display_order: row.display_order,
      is_active: Number(row.is_active),
    });
  }

  return filtered.map((row) => {
    const images = imagesMap.get(row.id) || [];
    const features = featureMap.get(row.id) || [];
    const specs = specMap.get(row.id) || [];
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      category_id: row.category_id,
      category: row.category_slug || "",
      category_name: row.category_name || "",
      category_icon: row.category_icon || "",
      rent_price: Number(row.rent_price || 0),
      buy_price: Number(row.buy_price || 0),
      rent_unit: row.rent_unit || "month",
      price_type: row.price_type || "both",
      image: row.image || "",
      images: images.map((item) => item.image_url),
      description: row.description || "",
      benefits: parseArray(row.benefits_json, []),
      specifications: parseArray(row.specifications_json, []),
      features: parseArray(row.features_json, []),
      related_products: parseArray(row.related_products_json, []),
      product_images: images,
      product_features: features,
      product_specifications: specs,
      is_top_selling: Number(row.is_top_selling) === 1,
      display_order: row.display_order,
      available: Number(row.is_active) === 1,
      is_active: Number(row.is_active),
    };
  });
}

async function getProductByIdentifier(identifier) {
  const rows = await query(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id = ? OR p.slug = ?
     LIMIT 1`,
    [identifier, identifier]
  );
  if (!rows[0]) return null;
  const [product] = await buildProducts(true, { search: rows[0].slug });
  return product || null;
}

async function buildTestimonials(includeInactive = false) {
  const rows = await query("SELECT * FROM testimonials ORDER BY display_order ASC, id ASC");
  return rows
    .filter((row) => includeInactive || Number(row.is_active) === 1)
    .map((row) => ({
      id: row.id,
      client_name: row.client_name,
      client_photo: row.client_photo || "",
      review_text: row.review_text || "",
      rating: Number(row.rating || 5),
      location: row.location || "",
      display_order: row.display_order,
      is_active: Number(row.is_active),
    }));
}

async function buildGallery(includeInactive = false) {
  const rows = await query("SELECT * FROM gallery ORDER BY display_order ASC, id ASC");
  return rows
    .filter((row) => includeInactive || Number(row.is_active) === 1)
    .map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category || "",
      image_url: row.image_url || "",
      alt_text: row.alt_text || "",
      display_order: row.display_order,
      is_active: Number(row.is_active),
    }));
}

async function buildBlogs(includeInactive = false) {
  const rows = await query("SELECT * FROM blogs ORDER BY display_order ASC, published_at DESC, id DESC");
  return rows
    .filter((row) => includeInactive || Number(row.published) === 1)
    .map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      image: row.image || "",
      short_description: row.short_description || "",
      content: row.content || "",
      seo_title: row.seo_title || "",
      meta_description: row.meta_description || "",
      keywords: row.keywords || "",
      published: Number(row.published) === 1,
      published_at: row.published_at || null,
      display_order: row.display_order,
    }));
}

async function buildSeo(pageName = null, includeInactive = false) {
  const rows = await query("SELECT * FROM seo_settings ORDER BY page_name ASC, id ASC");
  const mapped = rows.map((row) => ({
    id: row.id,
    page_name: row.page_name,
    meta_title: row.meta_title || "",
    meta_description: row.meta_description || "",
    keywords: row.keywords || "",
    og_image: row.og_image || "",
    canonical_url: row.canonical_url || "",
  }));
  if (!pageName) return mapped;
  return mapped.find((row) => row.page_name === pageName) || null;
}

async function buildHomeContent(includeInactive = false) {
  const rows = await query("SELECT * FROM home_sections ORDER BY id ASC");
  const sections = {};
  for (const row of rows) {
    if (!includeInactive && Number(row.is_active) !== 1) continue;
    sections[row.section_key] = {
      id: row.id,
      section_key: row.section_key,
      section_label: row.section_label,
      content: parseJson(row.content_json, null),
      is_active: Number(row.is_active),
      updated_at: row.updated_at,
    };
  }
  return {
    heroSlides: sections.hero_slides?.content || [],
    trustHighlights: sections.trust_highlights?.content || [],
    clientLogos: sections.client_logos?.content || [],
    homeImages: sections.home_images?.content || [],
    seo: sections.seo?.content || null,
    sections,
  };
}

async function buildAboutContent(includeInactive = false) {
  const rows = await query("SELECT * FROM about_sections ORDER BY id ASC");
  const sections = {};
  for (const row of rows) {
    if (!includeInactive && Number(row.is_active) !== 1) continue;
    sections[row.section_key] = {
      id: row.id,
      section_key: row.section_key,
      section_label: row.section_label,
      content: parseJson(row.content_json, null),
      is_active: Number(row.is_active),
      updated_at: row.updated_at,
    };
  }
  return {
    hero: sections.hero?.content || null,
    overview: sections.overview?.content || null,
    mission: sections.mission?.content || null,
    vision: sections.vision?.content || null,
    values: sections.values?.content || [],
    counters: sections.counters?.content || [],
    process: sections.process?.content || [],
    seo: sections.seo?.content || null,
    sections,
  };
}

async function saveProductRelations(connection, productId, payload, current = null) {
  const imagePayload = payload.images !== undefined || payload.product_images !== undefined
    ? parseArray(payload.images ?? payload.product_images ?? [])
    : (current?.images || []);
  const featurePayload = payload.features !== undefined || payload.product_features !== undefined
    ? parseArray(payload.features ?? payload.product_features ?? [])
    : (current?.features || []);
  const specPayload = payload.specifications !== undefined || payload.product_specifications !== undefined
    ? parseArray(payload.specifications ?? payload.product_specifications ?? [])
    : (current?.specifications || []);
  const relatedPayload = payload.related_products !== undefined
    ? parseArray(payload.related_products ?? [])
    : (current?.related_products || []);
  const benefitPayload = payload.benefits !== undefined
    ? parseArray(payload.benefits ?? [])
    : (current?.benefits || []);

  await connection.query("DELETE FROM product_images WHERE product_id = ?", [productId]);
  await connection.query("DELETE FROM product_features WHERE product_id = ?", [productId]);
  await connection.query("DELETE FROM product_specifications WHERE product_id = ?", [productId]);

  let order = 1;
  const imageCandidates = imagePayload.length
    ? imagePayload
    : [payload.image, payload.image1, payload.image2, payload.image3, current?.image].filter(Boolean);
  for (const image of imageCandidates) {
    await connection.query(
      "INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_active) VALUES (?, ?, ?, ?, 1)",
      [productId, image, payload.name || payload.title || "Product", order++]
    );
  }

  order = 1;
  for (const feature of featurePayload) {
    const featureValue = typeof feature === "string" ? feature : feature?.title || feature?.name || "";
    const featureDescription = typeof feature === "object" ? feature?.description || "" : "";
    if (!featureValue) continue;
    await connection.query(
      "INSERT INTO product_features (product_id, title, description, display_order, is_active) VALUES (?, ?, ?, ?, 1)",
      [productId, featureValue, featureDescription, order++]
    );
  }

  order = 1;
  for (const spec of specPayload) {
    if (typeof spec === "string") {
      const [label, ...rest] = spec.split(":");
      await connection.query(
        "INSERT INTO product_specifications (product_id, label, value, display_order, is_active) VALUES (?, ?, ?, ?, 1)",
        [productId, label.trim(), rest.join(":").trim() || null, order++]
      );
      continue;
    }
    const label = spec?.label || spec?.title || spec?.name;
    if (!label) continue;
    await connection.query(
      "INSERT INTO product_specifications (product_id, label, value, display_order, is_active) VALUES (?, ?, ?, ?, 1)",
      [productId, label, spec?.value || spec?.description || null, order++]
    );
  }

  await connection.query("UPDATE products SET benefits_json = ?, related_products_json = ? WHERE id = ?", [
    stringifyJson(benefitPayload),
    stringifyJson(relatedPayload),
    productId,
  ]);
}

async function upsertProduct(connection, payload, existingId = null) {
  const existingRow = existingId
    ? await connection.query("SELECT * FROM products WHERE id = ? LIMIT 1", [existingId])
    : [[], []];
  const currentRow = existingRow[0]?.[0] || null;
  const currentProduct = currentRow ? (await buildProducts(true, { search: currentRow.slug }))[0] : null;

  const name = String(payload.name ?? currentRow?.name ?? "").trim();
  if (!name) {
    throw new Error("Product name is required");
  }

  const slug = String(payload.slug || "").trim() || currentRow?.slug || createSlug(name);
  const categoryIdentifier = payload.category_id ?? payload.category ?? currentRow?.category_id ?? currentRow?.category_slug ?? null;
  const categoryId = await findCategoryIdByIdentifier(connection, categoryIdentifier);

  const resolvedImage = payload.image ?? payload.image1 ?? currentRow?.image ?? null;
  const benefitsSource = payload.benefits !== undefined ? payload.benefits : currentProduct?.benefits || parseArray(currentRow?.benefits_json, []);
  const specificationsSource = payload.specifications !== undefined ? payload.specifications : currentProduct?.specifications || parseArray(currentRow?.specifications_json, []);
  const featuresSource = payload.features !== undefined ? payload.features : currentProduct?.features || parseArray(currentRow?.features_json, []);
  const relatedSource = payload.related_products !== undefined ? payload.related_products : currentProduct?.related_products || parseArray(currentRow?.related_products_json, []);
  const rentPrice = payload.rent_price ?? currentRow?.rent_price ?? null;
  const buyPrice = payload.buy_price ?? currentRow?.buy_price ?? null;
  const rentUnit = payload.rent_unit || currentRow?.rent_unit || "month";
  const priceType = payload.price_type || currentRow?.price_type || "both";
  const displayOrder = payload.display_order !== undefined ? payload.display_order : currentRow?.display_order ?? 0;
  const isTopSelling = payload.is_top_selling !== undefined ? toBoolean(payload.is_top_selling, 0) : toBoolean(currentRow?.is_top_selling, 0);
  const isActive = payload.is_active !== undefined ? toBoolean(payload.is_active, 1) : toBoolean(currentRow?.is_active, 1);

  const values = [
    name,
    slug,
    categoryId,
    rentPrice,
    buyPrice,
    rentUnit,
    priceType,
    resolvedImage,
    payload.description !== undefined ? payload.description : currentRow?.description || "",
    stringifyJson(parseArray(benefitsSource ?? [])),
    stringifyJson(parseArray(specificationsSource ?? [])),
    stringifyJson(parseArray(featuresSource ?? [])),
    stringifyJson(parseArray(relatedSource ?? [])),
    isTopSelling,
    toNumber(displayOrder ?? 0),
    isActive,
  ];

  if (existingId) {
    await connection.query(
      `UPDATE products
       SET name = ?, slug = ?, category_id = ?, rent_price = ?, buy_price = ?, rent_unit = ?, price_type = ?,
           image = ?, description = ?, benefits_json = ?, specifications_json = ?, features_json = ?,
           related_products_json = ?, is_top_selling = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [...values, existingId]
    );
    await saveProductRelations(connection, existingId, payload, currentProduct || currentRow);
    return existingId;
  }

  const [insertResult] = await connection.query(
    `INSERT INTO products
     (name, slug, category_id, rent_price, buy_price, rent_unit, price_type, image, description,
      benefits_json, specifications_json, features_json, related_products_json, is_top_selling, display_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values
  );

  await saveProductRelations(connection, insertResult.insertId, payload, null);
  return insertResult.insertId;
}

async function resolveProduct(productRow) {
  if (!productRow) return null;
  const [product] = await buildProducts(true, {
    search: productRow.slug,
  });
  if (product) return product;
  return {
    id: productRow.id,
    slug: productRow.slug,
    name: productRow.name,
    category_id: productRow.category_id,
    category: productRow.category_slug || "",
    category_name: productRow.category_name || "",
    category_icon: productRow.category_icon || "",
    rent_price: Number(productRow.rent_price || 0),
    buy_price: Number(productRow.buy_price || 0),
    rent_unit: productRow.rent_unit || "month",
    price_type: productRow.price_type || "both",
    image: productRow.image || "",
    images: [],
    description: productRow.description || "",
    benefits: parseArray(productRow.benefits_json, []),
    specifications: parseArray(productRow.specifications_json, []),
    features: parseArray(productRow.features_json, []),
    related_products: parseArray(productRow.related_products_json, []),
    product_images: [],
    product_features: [],
    product_specifications: [],
    is_top_selling: Number(productRow.is_top_selling) === 1,
    display_order: productRow.display_order,
    available: Number(productRow.is_active) === 1,
    is_active: Number(productRow.is_active),
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "API is healthy" });
});

app.post(
  "/api/admin/login",
  adminLoginLimiter,
  asyncHandler(async (req, res) => {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");
    if (!username || !password) {
      return sendError(res, 400, "Username and password are required");
    }

    const admin = await getAdminByUsername(username);
    if (!admin || Number(admin.is_active) !== 1) {
      return sendError(res, 401, "Invalid credentials");
    }

    const matched = await bcrypt.compare(password, admin.password_hash);
    if (!matched) {
      return sendError(res, 401, "Invalid credentials");
    }

    await execute("UPDATE admins SET last_login_at = NOW() WHERE id = ?", [admin.id]);
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role, name: admin.name },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return sendSuccess(
      res,
      {
        token,
        admin: sanitizeAdmin(admin),
      },
      "Login successful"
    );
  })
);

app.get(
  "/api/admin/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const admin = await getAdminById(req.user.id);
    if (!admin) return sendError(res, 404, "Admin not found");
    return sendSuccess(res, sanitizeAdmin(admin));
  })
);

app.post(
  "/api/admin/logout",
  requireAuth,
  asyncHandler(async (_req, res) => {
    return sendSuccess(res, null, "Logged out");
  })
);

app.post(
  "/api/admin/change-password",
  requireAuth,
  asyncHandler(async (req, res) => {
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");
    if (!currentPassword || !newPassword) {
      return sendError(res, 400, "Current password and new password are required");
    }
    if (newPassword.length < 8) {
      return sendError(res, 400, "New password must be at least 8 characters long");
    }

    const admin = await getAdminById(req.user.id);
    if (!admin) return sendError(res, 404, "Admin not found");

    const matched = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!matched) {
      return sendError(res, 400, "Current password is incorrect");
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await execute("UPDATE admins SET password_hash = ? WHERE id = ?", [newHash, admin.id]);
    return sendSuccess(res, null, "Password updated");
  })
);

app.get(
  "/api/dashboard/stats",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const [servicesCount, enquiriesCount, galleryCount, testimonialsCount, categoriesCount, productsCount, blogsCount, vendorsCount, recentEnquiries] =
      await Promise.all([
        query("SELECT COUNT(*) AS count FROM services"),
        query("SELECT COUNT(*) AS count FROM enquiries"),
        query("SELECT COUNT(*) AS count FROM gallery"),
        query("SELECT COUNT(*) AS count FROM testimonials"),
        query("SELECT COUNT(*) AS count FROM categories"),
        query("SELECT COUNT(*) AS count FROM products"),
        query("SELECT COUNT(*) AS count FROM blogs"),
        query("SELECT COUNT(*) AS count FROM vendors"),
        query(
          `SELECT id, name, phone, email, service_interested, message, status, admin_notes, created_at
           FROM enquiries
           ORDER BY created_at DESC, id DESC
           LIMIT 5`
        ),
      ]);

    return sendSuccess(res, {
      totalServices: Number(servicesCount[0]?.count || 0),
      totalEnquiries: Number(enquiriesCount[0]?.count || 0),
      totalGallery: Number(galleryCount[0]?.count || 0),
      totalTestimonials: Number(testimonialsCount[0]?.count || 0),
      totalCategories: Number(categoriesCount[0]?.count || 0),
      totalProducts: Number(productsCount[0]?.count || 0),
      totalBlogs: Number(blogsCount[0]?.count || 0),
      totalVendors: Number(vendorsCount[0]?.count || 0),
      recentEnquiries,
    });
  })
);

app.get(
  "/api/site-settings",
  optionalAuth,
  asyncHandler(async (_req, res) => {
    return sendSuccess(res, await loadSiteSettings());
  })
);

app.put(
  "/api/site-settings",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const entries = Array.isArray(body.entries)
      ? body.entries
      : Object.entries(body).map(([setting_key, setting_value]) => ({ setting_key, setting_value }));
    for (const entry of entries) {
      if (!entry.setting_key) continue;
      await upsertSetting(entry.setting_key, entry.setting_value);
    }
    return sendSuccess(res, await loadSiteSettings(), "Site settings updated");
  })
);

app.get(
  "/api/contact-settings",
  optionalAuth,
  asyncHandler(async (_req, res) => {
    return sendSuccess(res, await loadContactSettings());
  })
);

app.put(
  "/api/contact-settings",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const payload = {
      phone: body.phone || "",
      whatsapp: body.whatsapp || "",
      email: body.email || "",
      address: body.address || "",
      map_iframe: body.map_iframe || "",
      business_hours: body.business_hours || "",
      social_links: parseObject(body.social_links || body.social_links_json || {}, {}),
    };
    await saveContactSettings(payload);
    return sendSuccess(res, await loadContactSettings(), "Contact settings updated");
  })
);

app.get(
  "/api/categories",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const includeInactive = Boolean(req.user) || String(req.query.all || "") === "1";
    return sendSuccess(res, await buildCategories(includeInactive));
  })
);

app.post(
  "/api/categories",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const name = String(body.name || "").trim();
    if (!name) return sendError(res, 400, "Category name is required");
    const slug = String(body.slug || "").trim() || createSlug(name);
    const result = await execute(
      `INSERT INTO categories (name, slug, icon, image, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, slug, body.icon || null, body.image || null, toNumber(body.display_order || 0), body.is_active === undefined ? 1 : toBoolean(body.is_active, 1)]
    );
    return sendSuccess(res, { id: result.insertId, slug }, "Category created");
  })
);

app.put(
  "/api/categories/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const categoryId = req.params.id;
    const existing = await findRowByIdentifier("categories", categoryId);
    if (!existing) return sendError(res, 404, "Category not found");
    const name = String(body.name || existing.name).trim();
    const slug = String(body.slug || existing.slug).trim() || createSlug(name);
    await execute(
      `UPDATE categories SET name = ?, slug = ?, icon = ?, image = ?, display_order = ?, is_active = ? WHERE id = ?`,
      [
        name,
        slug,
        body.icon ?? existing.icon,
        body.image ?? existing.image,
        toNumber(body.display_order ?? existing.display_order ?? 0),
        body.is_active === undefined ? existing.is_active : toBoolean(body.is_active, existing.is_active),
        existing.id,
      ]
    );
    return sendSuccess(res, { id: existing.id, slug }, "Category updated");
  })
);

app.delete(
  "/api/categories/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await deleteRowByIdentifier("categories", req.params.id);
    if (!result.affectedRows) return sendError(res, 404, "Category not found");
    return sendSuccess(res, null, "Category deleted");
  })
);

app.get(
  "/api/services",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const includeInactive = Boolean(req.user) || String(req.query.all || "") === "1";
    return sendSuccess(res, await buildServices(includeInactive));
  })
);

app.get(
  "/api/services/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const row = await findRowByIdentifier("services", req.params.id);
    if (!row) return sendError(res, 404, "Service not found");
    if (!req.user && Number(row.is_active) !== 1) return sendError(res, 404, "Service not found");
    return sendSuccess(res, {
      id: row.id,
      title: row.title,
      slug: row.slug,
      short_description: row.short_description || "",
      full_description: row.full_description || "",
      image: row.image || "",
      icon: row.icon || "",
      features: parseArray(row.features_json, []),
      display_order: row.display_order,
      is_active: Number(row.is_active),
    });
  })
);

app.post(
  "/api/services",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const title = String(body.title || "").trim();
    if (!title) return sendError(res, 400, "Service title is required");
    const slug = String(body.slug || "").trim() || createSlug(title);
    const result = await execute(
      `INSERT INTO services (title, slug, short_description, full_description, image, icon, features_json, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        body.short_description || "",
        body.full_description || "",
        body.image || null,
        body.icon || null,
        stringifyJson(parseArray(body.features ?? [])),
        toNumber(body.display_order || 0),
        body.is_active === undefined ? 1 : toBoolean(body.is_active, 1),
      ]
    );
    return sendSuccess(res, { id: result.insertId, slug }, "Service created");
  })
);

app.put(
  "/api/services/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const existing = await findRowByIdentifier("services", req.params.id);
    if (!existing) return sendError(res, 404, "Service not found");
    const title = String(body.title || existing.title).trim();
    const slug = String(body.slug || existing.slug).trim() || createSlug(title);
    await execute(
      `UPDATE services SET title = ?, slug = ?, short_description = ?, full_description = ?, image = ?, icon = ?, features_json = ?, display_order = ?, is_active = ? WHERE id = ?`,
      [
        title,
        slug,
        body.short_description ?? existing.short_description,
        body.full_description ?? existing.full_description,
        body.image ?? existing.image,
        body.icon ?? existing.icon,
        stringifyJson(parseArray(body.features ?? parseJson(existing.features_json, []))),
        toNumber(body.display_order ?? existing.display_order ?? 0),
        body.is_active === undefined ? existing.is_active : toBoolean(body.is_active, existing.is_active),
        existing.id,
      ]
    );
    return sendSuccess(res, { id: existing.id, slug }, "Service updated");
  })
);

app.delete(
  "/api/services/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await deleteRowByIdentifier("services", req.params.id);
    if (!result.affectedRows) return sendError(res, 404, "Service not found");
    return sendSuccess(res, null, "Service deleted");
  })
);

app.get(
  "/api/products",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const includeInactive = Boolean(req.user) || String(req.query.all || "") === "1";
    const productsList = await buildProducts(includeInactive, {
      search: req.query.search || "",
      category: req.query.category || "",
      topSellingOnly: String(req.query.top_selling || "") === "1",
    });
    return sendSuccess(res, productsList);
  })
);

app.get(
  "/api/products/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const row = await findProductByIdentifier(req.params.id);
    if (!row) return sendError(res, 404, "Product not found");
    if (!req.user && Number(row.is_active) !== 1) return sendError(res, 404, "Product not found");
    const product = await resolveProduct(row);
    return sendSuccess(res, product);
  })
);

app.post(
  "/api/products",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      const productId = await upsertProduct(connection, body, null);
      await connection.commit();
      return sendSuccess(res, { id: productId }, "Product created");
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  })
);

app.put(
  "/api/products/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const existing = await findRowByIdentifier("products", req.params.id);
    if (!existing) return sendError(res, 404, "Product not found");
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      await upsertProduct(connection, body, existing.id);
      await connection.commit();
      return sendSuccess(res, { id: existing.id }, "Product updated");
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  })
);

app.delete(
  "/api/products/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await deleteRowByIdentifier("products", req.params.id);
    if (!result.affectedRows) return sendError(res, 404, "Product not found");
    return sendSuccess(res, null, "Product deleted");
  })
);

app.get(
  "/api/gallery",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const includeInactive = Boolean(req.user) || String(req.query.all || "") === "1";
    return sendSuccess(res, await buildGallery(includeInactive));
  })
);

app.post(
  "/api/gallery",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const title = String(body.title || "").trim();
    const imageUrl = String(body.image_url || body.image || "").trim();
    if (!title || !imageUrl) return sendError(res, 400, "Gallery title and image are required");
    const result = await execute(
      `INSERT INTO gallery (title, category, image_url, alt_text, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, body.category || "", imageUrl, body.alt_text || "", toNumber(body.display_order || 0), body.is_active === undefined ? 1 : toBoolean(body.is_active, 1)]
    );
    return sendSuccess(res, { id: result.insertId }, "Gallery item created");
  })
);

app.put(
  "/api/gallery/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const existing = await query("SELECT * FROM gallery WHERE id = ? LIMIT 1", [req.params.id]);
    if (!existing[0]) return sendError(res, 404, "Gallery item not found");
    await execute(
      `UPDATE gallery SET title = ?, category = ?, image_url = ?, alt_text = ?, display_order = ?, is_active = ? WHERE id = ?`,
      [
        body.title ?? existing[0].title,
        body.category ?? existing[0].category,
        body.image_url ?? body.image ?? existing[0].image_url,
        body.alt_text ?? existing[0].alt_text,
        toNumber(body.display_order ?? existing[0].display_order ?? 0),
        body.is_active === undefined ? existing[0].is_active : toBoolean(body.is_active, existing[0].is_active),
        existing[0].id,
      ]
    );
    return sendSuccess(res, { id: existing[0].id }, "Gallery item updated");
  })
);

app.delete(
  "/api/gallery/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    await execute("DELETE FROM gallery WHERE id = ?", [req.params.id]);
    return sendSuccess(res, null, "Gallery item deleted");
  })
);

app.get(
  "/api/testimonials",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const includeInactive = Boolean(req.user) || String(req.query.all || "") === "1";
    return sendSuccess(res, await buildTestimonials(includeInactive));
  })
);

app.post(
  "/api/testimonials",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const clientName = String(body.client_name || "").trim();
    const reviewText = String(body.review_text || "").trim();
    if (!clientName || !reviewText) return sendError(res, 400, "Client name and review text are required");
    const result = await execute(
      `INSERT INTO testimonials (client_name, client_photo, review_text, rating, location, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        clientName,
        body.client_photo || "",
        reviewText,
        Number(body.rating || 5),
        body.location || "",
        toNumber(body.display_order || 0),
        body.is_active === undefined ? 1 : toBoolean(body.is_active, 1),
      ]
    );
    return sendSuccess(res, { id: result.insertId }, "Testimonial created");
  })
);

app.put(
  "/api/testimonials/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const existing = await query("SELECT * FROM testimonials WHERE id = ? LIMIT 1", [req.params.id]);
    if (!existing[0]) return sendError(res, 404, "Testimonial not found");
    await execute(
      `UPDATE testimonials SET client_name = ?, client_photo = ?, review_text = ?, rating = ?, location = ?, display_order = ?, is_active = ? WHERE id = ?`,
      [
        body.client_name ?? existing[0].client_name,
        body.client_photo ?? existing[0].client_photo,
        body.review_text ?? existing[0].review_text,
        Number(body.rating ?? existing[0].rating ?? 5),
        body.location ?? existing[0].location,
        toNumber(body.display_order ?? existing[0].display_order ?? 0),
        body.is_active === undefined ? existing[0].is_active : toBoolean(body.is_active, existing[0].is_active),
        existing[0].id,
      ]
    );
    return sendSuccess(res, { id: existing[0].id }, "Testimonial updated");
  })
);

app.delete(
  "/api/testimonials/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    await execute("DELETE FROM testimonials WHERE id = ?", [req.params.id]);
    return sendSuccess(res, null, "Testimonial deleted");
  })
);

app.get(
  "/api/blogs",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const includeInactive = Boolean(req.user) || String(req.query.all || "") === "1";
    const blogsList = await buildBlogs(includeInactive);
    return sendSuccess(res, blogsList);
  })
);

app.get(
  "/api/blogs/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const row = await findRowByIdentifier("blogs", req.params.id);
    if (!row) return sendError(res, 404, "Blog not found");
    if (!req.user && Number(row.published) !== 1) return sendError(res, 404, "Blog not found");
    return sendSuccess(res, {
      id: row.id,
      title: row.title,
      slug: row.slug,
      image: row.image || "",
      short_description: row.short_description || "",
      content: row.content || "",
      seo_title: row.seo_title || "",
      meta_description: row.meta_description || "",
      keywords: row.keywords || "",
      published: Number(row.published) === 1,
      published_at: row.published_at || null,
      display_order: row.display_order,
    });
  })
);

app.post(
  "/api/blogs",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const title = String(body.title || "").trim();
    if (!title) return sendError(res, 400, "Blog title is required");
    const slug = String(body.slug || "").trim() || createSlug(title);
    const published = body.published === undefined ? 0 : toBoolean(body.published, 0);
    const publishedAt = published ? body.published_at || new Date() : null;
    const result = await execute(
      `INSERT INTO blogs (title, slug, image, short_description, content, seo_title, meta_description, keywords, published, published_at, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        body.image || null,
        body.short_description || "",
        body.content || "",
        body.seo_title || "",
        body.meta_description || "",
        body.keywords || "",
        published,
        publishedAt,
        toNumber(body.display_order || 0),
      ]
    );
    return sendSuccess(res, { id: result.insertId, slug }, "Blog created");
  })
);

app.put(
  "/api/blogs/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const existing = await findRowByIdentifier("blogs", req.params.id);
    if (!existing) return sendError(res, 404, "Blog not found");
    const title = String(body.title || existing.title).trim();
    const slug = String(body.slug || existing.slug).trim() || createSlug(title);
    const published = body.published === undefined ? existing.published : toBoolean(body.published, existing.published);
    const publishedAt = published ? body.published_at || existing.published_at || new Date() : null;
    await execute(
      `UPDATE blogs SET title = ?, slug = ?, image = ?, short_description = ?, content = ?, seo_title = ?, meta_description = ?, keywords = ?, published = ?, published_at = ?, display_order = ? WHERE id = ?`,
      [
        title,
        slug,
        body.image ?? existing.image,
        body.short_description ?? existing.short_description,
        body.content ?? existing.content,
        body.seo_title ?? existing.seo_title,
        body.meta_description ?? existing.meta_description,
        body.keywords ?? existing.keywords,
        published,
        publishedAt,
        toNumber(body.display_order ?? existing.display_order ?? 0),
        existing.id,
      ]
    );
    return sendSuccess(res, { id: existing.id, slug }, "Blog updated");
  })
);

app.delete(
  "/api/blogs/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await deleteRowByIdentifier("blogs", req.params.id);
    if (!result.affectedRows) return sendError(res, 404, "Blog not found");
    return sendSuccess(res, null, "Blog deleted");
  })
);

app.get(
  "/api/seo",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const page = String(req.query.page || "").trim();
    const seo = await buildSeo(page || null);
    return sendSuccess(res, seo);
  })
);

app.put(
  "/api/seo",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const entries = Array.isArray(body.entries)
      ? body.entries
      : body.page_name
        ? [body]
        : Object.entries(body).map(([page_name, item]) => ({
            page_name,
            ...(typeof item === "object" ? item : { meta_title: String(item) }),
          }));

    for (const entry of entries) {
      if (!entry.page_name) continue;
      await execute(
        `INSERT INTO seo_settings (page_name, meta_title, meta_description, keywords, og_image, canonical_url)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE meta_title = VALUES(meta_title), meta_description = VALUES(meta_description), keywords = VALUES(keywords), og_image = VALUES(og_image), canonical_url = VALUES(canonical_url)`,
        [
          entry.page_name,
          entry.meta_title || "",
          entry.meta_description || "",
          entry.keywords || "",
          entry.og_image || "",
          entry.canonical_url || "",
        ]
      );
    }
    return sendSuccess(res, await buildSeo(null), "SEO settings updated");
  })
);

app.get(
  "/api/home",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const includeInactive = Boolean(req.user) || String(req.query.all || "") === "1";
    return sendSuccess(res, await buildHomeContent(includeInactive));
  })
);

app.put(
  "/api/home",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    if (body.heroSlides !== undefined) {
      await upsertSection("home_sections", "hero_slides", "Hero Slides", body.heroSlides, body.heroSlidesActive ?? 1);
    }
    if (body.trustHighlights !== undefined) {
      await upsertSection("home_sections", "trust_highlights", "Trust Highlights", body.trustHighlights, body.trustHighlightsActive ?? 1);
    }
    if (body.clientLogos !== undefined) {
      await upsertSection("home_sections", "client_logos", "Client Logos", body.clientLogos, body.clientLogosActive ?? 1);
    }
    if (body.homeImages !== undefined) {
      await upsertSection("home_sections", "home_images", "Home Images", body.homeImages, body.homeImagesActive ?? 1);
    }
    if (body.seo !== undefined) {
      await upsertSection("home_sections", "seo", "Home SEO", body.seo, body.seoActive ?? 1);
    }
    return sendSuccess(res, await buildHomeContent(true), "Home content updated");
  })
);

app.get(
  "/api/about",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const includeInactive = Boolean(req.user) || String(req.query.all || "") === "1";
    return sendSuccess(res, await buildAboutContent(includeInactive));
  })
);

app.put(
  "/api/about",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    if (body.hero !== undefined) {
      await upsertSection("about_sections", "hero", "About Hero", body.hero, body.heroActive ?? 1);
    }
    if (body.overview !== undefined) {
      await upsertSection("about_sections", "overview", "About Overview", body.overview, body.overviewActive ?? 1);
    }
    if (body.mission !== undefined) {
      await upsertSection("about_sections", "mission", "Mission", body.mission, body.missionActive ?? 1);
    }
    if (body.vision !== undefined) {
      await upsertSection("about_sections", "vision", "Vision", body.vision, body.visionActive ?? 1);
    }
    if (body.values !== undefined) {
      await upsertSection("about_sections", "values", "Why Choose Us", body.values, body.valuesActive ?? 1);
    }
    if (body.counters !== undefined) {
      await upsertSection("about_sections", "counters", "Experience Counters", body.counters, body.countersActive ?? 1);
    }
    if (body.process !== undefined) {
      await upsertSection("about_sections", "process", "Process", body.process, body.processActive ?? 1);
    }
    if (body.seo !== undefined) {
      await upsertSection("about_sections", "seo", "About SEO", body.seo, body.seoActive ?? 1);
    }
    return sendSuccess(res, await buildAboutContent(true), "About content updated");
  })
);

app.post(
  "/api/enquiries",
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    if (!name || !phone) return sendError(res, 400, "Name and phone are required");
    const result = await execute(
      `INSERT INTO enquiries (name, phone, email, service_interested, message, status, admin_notes, source_page)
       VALUES (?, ?, ?, ?, ?, 'new', ?, ?)`,
      [
        name,
        phone,
        body.email || "",
        body.service_interested || body.serviceInterested || body.equipment || "",
        body.message || "",
        body.admin_notes || "",
        body.source_page || body.sourcePage || "",
      ]
    );
    return sendSuccess(res, { id: result.insertId }, "Enquiry submitted");
  })
);

app.get(
  "/api/enquiries",
  requireAuth,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 10)));
    const offset = (page - 1) * limit;
    const status = String(req.query.status || "").trim();
    const search = String(req.query.search || "").trim().toLowerCase();

    let rows = await query("SELECT * FROM enquiries ORDER BY created_at DESC, id DESC");
    if (status) rows = rows.filter((row) => row.status === status);
    if (search) {
      rows = rows.filter((row) =>
        [row.name, row.phone, row.email, row.service_interested, row.message]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search))
      );
    }

    const total = rows.length;
    const paginated = rows.slice(offset, offset + limit);
    return sendSuccess(res, {
      items: paginated,
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  })
);

app.put(
  "/api/enquiries/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const existing = await query("SELECT * FROM enquiries WHERE id = ? LIMIT 1", [req.params.id]);
    if (!existing[0]) return sendError(res, 404, "Enquiry not found");
    await execute(
      `UPDATE enquiries SET name = ?, phone = ?, email = ?, service_interested = ?, message = ?, status = ?, admin_notes = ? WHERE id = ?`,
      [
        body.name ?? existing[0].name,
        body.phone ?? existing[0].phone,
        body.email ?? existing[0].email,
        body.service_interested ?? existing[0].service_interested,
        body.message ?? existing[0].message,
        body.status ?? existing[0].status,
        body.admin_notes ?? existing[0].admin_notes,
        existing[0].id,
      ]
    );
    return sendSuccess(res, null, "Enquiry updated");
  })
);

app.delete(
  "/api/enquiries/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    await execute("DELETE FROM enquiries WHERE id = ?", [req.params.id]);
    return sendSuccess(res, null, "Enquiry deleted");
  })
);

app.post(
  "/api/vendors",
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const vendorName = String(body.vendor_name || body.vendorName || "").trim();
    if (!vendorName) return sendError(res, 400, "Vendor name is required");
    const result = await execute(
      `INSERT INTO vendors (vendor_name, business_name, phone, email, address, category, gst_number, status, admin_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        vendorName,
        body.business_name || body.businessName || "",
        body.phone || "",
        body.email || "",
        body.address || "",
        body.category || "",
        body.gst_number || body.gstNumber || "",
        body.admin_notes || "",
      ]
    );
    return sendSuccess(res, { id: result.insertId }, "Vendor registration submitted");
  })
);

app.get(
  "/api/vendors",
  requireAuth,
  asyncHandler(async (req, res) => {
    const status = String(req.query.status || "").trim();
    let rows = await query("SELECT * FROM vendors ORDER BY created_at DESC, id DESC");
    if (status) rows = rows.filter((row) => row.status === status);
    return sendSuccess(res, rows);
  })
);

app.put(
  "/api/vendors/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseObject(req.body, {});
    const existing = await query("SELECT * FROM vendors WHERE id = ? LIMIT 1", [req.params.id]);
    if (!existing[0]) return sendError(res, 404, "Vendor not found");
    await execute(
      `UPDATE vendors SET vendor_name = ?, business_name = ?, phone = ?, email = ?, address = ?, category = ?, gst_number = ?, status = ?, admin_notes = ? WHERE id = ?`,
      [
        body.vendor_name ?? existing[0].vendor_name,
        body.business_name ?? existing[0].business_name,
        body.phone ?? existing[0].phone,
        body.email ?? existing[0].email,
        body.address ?? existing[0].address,
        body.category ?? existing[0].category,
        body.gst_number ?? existing[0].gst_number,
        body.status ?? existing[0].status,
        body.admin_notes ?? existing[0].admin_notes,
        existing[0].id,
      ]
    );
    return sendSuccess(res, null, "Vendor updated");
  })
);

app.delete(
  "/api/vendors/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    await execute("DELETE FROM vendors WHERE id = ?", [req.params.id]);
    return sendSuccess(res, null, "Vendor deleted");
  })
);

app.post(
  "/api/uploads",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) return sendError(res, 400, "File is required");
    return sendSuccess(res, {
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
    });
  })
);

app.post(
  "/api/uploads/multiple",
  requireAuth,
  upload.array("files", 12),
  asyncHandler(async (req, res) => {
    const files = Array.isArray(req.files) ? req.files : [];
    return sendSuccess(res, files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/${file.filename}`,
    })));
  })
);

app.use((err, _req, res, _next) => {
  console.error("API Error:", err);
  if (err instanceof multer.MulterError) {
    return sendError(res, 400, err.message);
  }
  return sendError(res, 500, err.message || "Internal server error");
});

async function start() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
