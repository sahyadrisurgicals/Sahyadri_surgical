import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import {
  aboutSections,
  blogs,
  categories,
  contactSettings,
  defaultAdmin,
  gallery,
  homeSections,
  products,
  seoSettings,
  services,
  siteSettings,
  testimonials,
} from "./seed-data.js";

export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_USER = process.env.DB_USER || "root";
export const DB_PASSWORD = process.env.DB_PASSWORD || "root";
export const DB_NAME = process.env.DB_NAME || "sahyadri_surgical";

const baseConfig = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  multipleStatements: false,
  dateStrings: false,
  connectionLimit: 10,
  waitForConnections: true,
  namedPlaceholders: true,
  charset: "utf8mb4",
};

let pool;

function json(value) {
  return JSON.stringify(value ?? null);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function safeParse(value, fallback) {
  if (value == null || value === "") return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function bootstrapDatabase() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: false,
    charset: "utf8mb4",
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.end();
}

function createPool() {
  if (pool) return pool;
  pool = mysql.createPool({
    ...baseConfig,
    database: DB_NAME,
  });
  return pool;
}

async function runStatements(connection, statements) {
  for (const statement of statements) {
    await connection.query(statement);
  }
}

async function ensureSchema(connection) {
  await runStatements(connection, [
    `CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      username VARCHAR(150) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'admin',
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      last_login_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      slug VARCHAR(220) NOT NULL UNIQUE,
      icon VARCHAR(100) DEFAULT NULL,
      image VARCHAR(500) DEFAULT NULL,
      display_order INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      slug VARCHAR(220) NOT NULL UNIQUE,
      short_description TEXT,
      full_description LONGTEXT,
      image VARCHAR(500) DEFAULT NULL,
      icon VARCHAR(100) DEFAULT NULL,
      features_json LONGTEXT,
      display_order INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      category_id INT NULL,
      rent_price DECIMAL(12,2) DEFAULT NULL,
      buy_price DECIMAL(12,2) DEFAULT NULL,
      rent_unit VARCHAR(50) DEFAULT 'month',
      price_type VARCHAR(20) DEFAULT 'both',
      image VARCHAR(500) DEFAULT NULL,
      description LONGTEXT,
      benefits_json LONGTEXT,
      specifications_json LONGTEXT,
      features_json LONGTEXT,
      related_products_json LONGTEXT,
      is_top_selling TINYINT(1) NOT NULL DEFAULT 0,
      display_order INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS product_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      alt_text VARCHAR(255) DEFAULT NULL,
      display_order INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS product_features (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT NULL,
      display_order INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_product_features_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS product_specifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      label VARCHAR(255) NOT NULL,
      value VARCHAR(255) DEFAULT NULL,
      display_order INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_product_specs_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS gallery (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(150) DEFAULT NULL,
      image_url VARCHAR(500) NOT NULL,
      alt_text VARCHAR(255) DEFAULT NULL,
      display_order INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS testimonials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_name VARCHAR(200) NOT NULL,
      client_photo VARCHAR(500) DEFAULT NULL,
      review_text LONGTEXT NOT NULL,
      rating INT NOT NULL DEFAULT 5,
      location VARCHAR(200) DEFAULT NULL,
      display_order INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS contact_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      phone VARCHAR(100) DEFAULT NULL,
      whatsapp VARCHAR(100) DEFAULT NULL,
      email VARCHAR(200) DEFAULT NULL,
      address TEXT DEFAULT NULL,
      map_iframe LONGTEXT DEFAULT NULL,
      business_hours VARCHAR(255) DEFAULT NULL,
      social_links_json LONGTEXT DEFAULT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS enquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      phone VARCHAR(80) NOT NULL,
      email VARCHAR(200) DEFAULT NULL,
      service_interested VARCHAR(255) DEFAULT NULL,
      message LONGTEXT DEFAULT NULL,
      status ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
      admin_notes LONGTEXT DEFAULT NULL,
      source_page VARCHAR(120) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS blogs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      image VARCHAR(500) DEFAULT NULL,
      short_description TEXT,
      content LONGTEXT,
      seo_title VARCHAR(255) DEFAULT NULL,
      meta_description TEXT,
      keywords TEXT,
      published TINYINT(1) NOT NULL DEFAULT 0,
      published_at DATETIME NULL,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS seo_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      page_name VARCHAR(150) NOT NULL UNIQUE,
      meta_title VARCHAR(255) DEFAULT NULL,
      meta_description TEXT,
      keywords TEXT,
      og_image VARCHAR(500) DEFAULT NULL,
      canonical_url VARCHAR(500) DEFAULT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS site_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(150) NOT NULL UNIQUE,
      setting_value LONGTEXT DEFAULT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS home_sections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      section_key VARCHAR(150) NOT NULL UNIQUE,
      section_label VARCHAR(200) NOT NULL,
      content_json LONGTEXT DEFAULT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS about_sections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      section_key VARCHAR(150) NOT NULL UNIQUE,
      section_label VARCHAR(200) NOT NULL,
      content_json LONGTEXT DEFAULT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS vendors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vendor_name VARCHAR(200) NOT NULL,
      business_name VARCHAR(255) DEFAULT NULL,
      phone VARCHAR(100) DEFAULT NULL,
      email VARCHAR(200) DEFAULT NULL,
      address TEXT DEFAULT NULL,
      category VARCHAR(150) DEFAULT NULL,
      gst_number VARCHAR(100) DEFAULT NULL,
      status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
      admin_notes LONGTEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  ]);
}

async function seedIfEmpty(connection, tableName, rows, columns) {
  const [result] = await connection.query(`SELECT COUNT(*) AS count FROM ${tableName}`);
  if (Number(result[0].count) > 0) return;
  if (!rows.length) return;

  const placeholders = columns.map(() => "?").join(", ");
  const query = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders})`;
  for (const row of rows) {
    const values = columns.map((column) => row[column]);
    await connection.query(query, values);
  }
}

async function seedAdmins(connection) {
  const passwordHash = await bcrypt.hash(defaultAdmin.password, 10);
  const [matchedRows] = await connection.query(
    "SELECT id FROM admins WHERE username IN (?, ?) ORDER BY CASE WHEN username = ? THEN 0 ELSE 1 END, id ASC LIMIT 1",
    [defaultAdmin.username, "admin", defaultAdmin.username]
  );

  if (matchedRows.length > 0) {
    await connection.query(
      "UPDATE admins SET name = ?, username = ?, password_hash = ?, role = ?, is_active = 1 WHERE id = ?",
      [defaultAdmin.name, defaultAdmin.username, passwordHash, defaultAdmin.role, matchedRows[0].id]
    );
    return;
  }

  const [fallbackRows] = await connection.query(
    "SELECT id FROM admins ORDER BY CASE WHEN role = 'super_admin' THEN 0 ELSE 1 END, id ASC LIMIT 1"
  );

  if (fallbackRows.length > 0) {
    await connection.query(
      "UPDATE admins SET name = ?, username = ?, password_hash = ?, role = ?, is_active = 1 WHERE id = ?",
      [defaultAdmin.name, defaultAdmin.username, passwordHash, defaultAdmin.role, fallbackRows[0].id]
    );
    return;
  }

  await connection.query(
    "INSERT INTO admins (name, username, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)",
    [defaultAdmin.name, defaultAdmin.username, passwordHash, defaultAdmin.role, 1]
  );
}

async function seedProductsBundle(connection) {
  const [result] = await connection.query("SELECT COUNT(*) AS count FROM products");
  if (Number(result[0].count) > 0) return;

  const categoryMap = new Map();
  const [categoryRows] = await connection.query("SELECT id, slug FROM categories");
  for (const row of categoryRows) {
    categoryMap.set(row.slug, row.id);
  }

  for (const product of products) {
    const [insertResult] = await connection.query(
      `INSERT INTO products
      (name, slug, category_id, rent_price, buy_price, rent_unit, price_type, image, description,
       benefits_json, specifications_json, features_json, related_products_json, is_top_selling, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.name,
        product.slug,
        categoryMap.get(product.category_slug) || null,
        product.rent_price,
        product.buy_price,
        product.rent_unit,
        product.price_type,
        product.image,
        product.description,
        json(product.benefits),
        json(product.specifications),
        json(product.features),
        json([]),
        product.is_top_selling,
        product.display_order,
        product.is_active,
      ]
    );

    const productId = insertResult.insertId;
    await connection.query(
      "INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_active) VALUES (?, ?, ?, ?, ?)",
      [productId, product.image, product.name, 1, 1]
    );

    let displayOrder = 1;
    for (const feature of product.features || []) {
      await connection.query(
        "INSERT INTO product_features (product_id, title, description, display_order, is_active) VALUES (?, ?, ?, ?, ?)",
        [productId, feature, null, displayOrder++, 1]
      );
    }

    displayOrder = 1;
    for (const spec of product.specifications || []) {
      await connection.query(
        "INSERT INTO product_specifications (product_id, label, value, display_order, is_active) VALUES (?, ?, ?, ?, ?)",
        [productId, spec, null, displayOrder++, 1]
      );
    }
  }
}

export async function initializeDatabase() {
  await bootstrapDatabase();
  const db = createPool();
  const connection = await db.getConnection();

  try {
    await ensureSchema(connection);
    await seedAdmins(connection);
    await seedIfEmpty(connection, "categories", categories, [
      "name",
      "slug",
      "icon",
      "image",
      "display_order",
      "is_active",
    ]);
    const servicesSeed = services.map((service) => ({
      ...service,
      features_json: json(service.features),
    }));
    await seedIfEmpty(connection, "services", servicesSeed, [
      "title",
      "slug",
      "short_description",
      "full_description",
      "image",
      "icon",
      "features_json",
      "display_order",
      "is_active",
    ]);
    await seedProductsBundle(connection);
    await seedIfEmpty(connection, "gallery", gallery, [
      "title",
      "category",
      "image_url",
      "alt_text",
      "display_order",
      "is_active",
    ]);
    await seedIfEmpty(connection, "testimonials", testimonials, [
      "client_name",
      "client_photo",
      "review_text",
      "rating",
      "location",
      "display_order",
      "is_active",
    ]);
    const contactSeed = {
      ...contactSettings,
      social_links_json: contactSettings.social_links,
    };
    await seedIfEmpty(connection, "contact_settings", [contactSeed], [
      "phone",
      "whatsapp",
      "email",
      "address",
      "map_iframe",
      "business_hours",
      "social_links_json",
    ]);
    await seedIfEmpty(connection, "blogs", blogs, [
      "title",
      "slug",
      "image",
      "short_description",
      "content",
      "seo_title",
      "meta_description",
      "keywords",
      "published",
      "display_order",
    ]);
    await seedIfEmpty(connection, "seo_settings", seoSettings, [
      "page_name",
      "meta_title",
      "meta_description",
      "keywords",
      "og_image",
      "canonical_url",
    ]);
    await seedIfEmpty(connection, "site_settings", siteSettings, [
      "setting_key",
      "setting_value",
    ]);
    await seedIfEmpty(connection, "home_sections", homeSections, [
      "section_key",
      "section_label",
      "content_json",
      "is_active",
    ]);
    await seedIfEmpty(connection, "about_sections", aboutSections, [
      "section_key",
      "section_label",
      "content_json",
      "is_active",
    ]);
  } finally {
    connection.release();
  }

  return db;
}

export function getPool() {
  if (!pool) {
    throw new Error("Database has not been initialized");
  }
  return pool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().query(sql, params);
  return rows;
}

export async function execute(sql, params = []) {
  const [result] = await getPool().execute(sql, params);
  return result;
}

export function parseJson(value, fallback = null) {
  return safeParse(value, fallback);
}

export function stringifyJson(value) {
  return json(value);
}

export function createSlug(value) {
  return slugify(value);
}
