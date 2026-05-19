import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
const PORT = process.env.PORT || 5000;
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "GOOGLE_SCRIPT_URL";

app.use(cors());
app.use(express.json());

// GET PRODUCTS
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, result) => {
    if (err) {
      console.log("DB Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.send(result);
  });
});

// ADD PRODUCT
app.post("/add-product", (req, res) => {
  const {
    name,
    category_id,
    rent_price,
    buy_price,
    description,
    image1,
    image2,
    image3,
    video_url,
    specifications,
    is_active,
  } = req.body;

  const categoryValue =
    typeof category_id === "string" && category_id.trim() !== "" && !Number.isNaN(Number(category_id))
      ? Number(category_id)
      : category_id;

  const specsValue =
    Array.isArray(specifications) ? JSON.stringify(specifications) : specifications;

  db.query(
    "INSERT INTO products (name, category_id, description, rent_price, buy_price, image1, image2, image3, video_url, specifications, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      name,
      categoryValue,
      description || null,
      rent_price || null,
      buy_price || null,
      image1 || null,
      image2 || null,
      image3 || null,
      video_url || null,
      specsValue || null,
      is_active ?? 1,
    ],
    (err, result) => {
      if (err) {
        console.log("DB Error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.send({ success: true, insertId: result.insertId });
    }
  );
});

// UPDATE PRODUCT
app.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const {
    name,
    category_id,
    rent_price,
    buy_price,
    description,
    image1,
    image2,
    image3,
    video_url,
    specifications,
    is_active,
  } = req.body;

  const categoryValue =
    typeof category_id === "string" && category_id.trim() !== "" && !Number.isNaN(Number(category_id))
      ? Number(category_id)
      : category_id;

  const specsValue =
    Array.isArray(specifications) ? JSON.stringify(specifications) : specifications;

  db.query(
    "UPDATE products SET name=?, category_id=?, description=?, rent_price=?, buy_price=?, image1=?, image2=?, image3=?, video_url=?, specifications=?, is_active=? WHERE id=?",
    [
      name,
      categoryValue,
      description || null,
      rent_price || null,
      buy_price || null,
      image1 || null,
      image2 || null,
      image3 || null,
      video_url || null,
      specsValue || null,
      is_active ?? 1,
      id,
    ],
    (err) => {
      if (err) {
        console.log("DB Error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.send({ success: true });
    }
  );
});

// DELETE PRODUCT
app.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM products WHERE id=?", [id], (err) => {
    if (err) {
      console.log("DB Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.send({ success: true });
  });
});

// ADD ENQUIRY
app.post("/enquiry", (req, res) => {
  const { name, phone, message } = req.body;

  db.query(
    "INSERT INTO enquiries (name, phone, message) VALUES (?, ?, ?)",
    [name, phone, message],
    (err, result) => {
      if (err) {
        console.log("DB Error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // Optional: backup to Google Sheets
      if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== "GOOGLE_SCRIPT_URL") {
        fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req.body),
        }).catch(fetchErr => {
          console.log("Google Sheets Backup Error:", fetchErr);
        });
      }

      res.send({ success: true });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
