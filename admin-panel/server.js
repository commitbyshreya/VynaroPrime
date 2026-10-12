import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 8787);
const uploadDirectory = path.join(__dirname, "uploads");

fs.mkdirSync(uploadDirectory, { recursive: true });

app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", process.env.STOREFRONT_ORIGIN || "*");
    response.header("Access-Control-Allow-Headers", "Content-Type, x-admin-key");
    response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (request.method === "OPTIONS") return response.sendStatus(204);
    return next();
});

const propertySchema = new mongoose.Schema({
    category: { type: String, enum: ["buy", "projects", "commercial", "luxury"], required: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    price: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    meta: { type: String, required: true, trim: true },
    bhk: { type: String, default: "" },
    area: { type: String, default: "" },
    furnishing: { type: String, default: "" },
    description: { type: String, default: "", trim: true },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
}, { timestamps: true });

const Property = mongoose.model("Property", propertySchema);

const leadSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    propertyName: { type: String, default: "", trim: true },
    source: { type: String, default: "advisor-popup", trim: true },
    status: { type: String, enum: ["new", "contacted"], default: "new" },
}, { timestamps: true });

const Lead = mongoose.model("Lead", leadSchema);

const storage = multer.diskStorage({
    destination: (_request, _file, callback) => callback(null, uploadDirectory),
    filename: (_request, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
    },
});

const upload = multer({
    storage,
    limits: { files: 12, fileSize: 8 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
        callback(null, file.mimetype.startsWith("image/"));
    },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDirectory));
app.use(express.static(path.join(__dirname, "public")));

function requireAdmin(request, response, next) {
    if (!process.env.ADMIN_KEY) {
        return response.status(500).json({ error: "ADMIN_KEY is not configured on the server." });
    }

    if (request.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
        return response.status(401).json({ error: "Invalid admin key." });
    }

    return next();
}

function parseAmenities(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
    return String(value).split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
}

function parseBoolean(value, fallback = false) {
    if (value === undefined) return fallback;
    return value === true || value === "true" || value === "on";
}

function normalizePrice(value) {
    const input = String(value || "").trim().replace(/^₹\s*/, "").replace(/,/g, "");
    const match = input.match(/^(\d+(?:\.\d+)?)\s*(cr|crore|crores|lac|lakh|lakhs)?$/i);
    if (!match) return input ? `₹${input}` : "";
    const amount = match[1];
    const unit = match[2]?.toLowerCase();
    if (unit && ["cr", "crore", "crores"].includes(unit)) return `₹${amount} Cr`;
    if (unit) return `₹${amount} Lac`;
    return `₹${amount}`;
}

function getPayload(request, existing = {}) {
    const bhk = request.body.bhk || existing.bhk || "";
    const area = request.body.area || existing.area || "";
    const furnishing = request.body.furnishing || existing.furnishing || "";
    const meta = [bhk, area ? `${area} sq.ft.` : "", furnishing].filter(Boolean).join(" · ") || request.body.meta || existing.meta || "Details available on request";
    return {
        category: request.body.category,
        name: request.body.name,
        location: request.body.location,
        price: normalizePrice(request.body.price),
        type: request.body.type,
        meta,
        bhk,
        area,
        furnishing,
        description: request.body.description || "",
        amenities: parseAmenities(request.body.amenities),
        featured: parseBoolean(request.body.featured, existing.featured),
        published: parseBoolean(request.body.published, existing.published ?? true),
    };
}

app.get("/api/health", (_request, response) => {
    response.json({ ok: true, database: mongoose.connection.readyState === 1 });
});

app.get("/api/properties", requireAdmin, async (_request, response) => {
    try {
        const properties = await Property.find().sort({ createdAt: -1 }).lean();
        response.json(properties);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

app.get("/api/properties/public", async (_request, response) => {
    try {
        const properties = await Property.find({ published: true }).sort({ featured: -1, createdAt: -1 }).lean();
        response.json(properties);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

app.post("/api/leads", async (request, response) => {
    try {
        const name = String(request.body.name || "").trim();
        const phone = String(request.body.phone || "").trim();
        if (!name || !phone) return response.status(400).json({ error: "Name and phone number are required." });
        const lead = await Lead.create({
            name,
            phone,
            propertyName: request.body.propertyName || "",
            source: request.body.source || "advisor-popup",
        });
        response.status(201).json({ ok: true, leadId: lead._id });
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
});

app.get("/api/leads", requireAdmin, async (_request, response) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 }).lean();
        response.json(leads);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

app.post("/api/properties", requireAdmin, upload.array("images", 12), async (request, response) => {
    try {
        const uploadedImages = request.files.map((file) => `/uploads/${file.filename}`);
        const property = await Property.create({ ...getPayload(request), images: uploadedImages });
        response.status(201).json(property);
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
});

app.put("/api/properties/:id", requireAdmin, upload.array("images", 12), async (request, response) => {
    try {
        const property = await Property.findById(request.params.id);
        if (!property) return response.status(404).json({ error: "Property not found." });

        const existingImages = request.body.existingImages ? JSON.parse(request.body.existingImages) : property.images;
        const uploadedImages = request.files.map((file) => `/uploads/${file.filename}`);
        property.set({ ...getPayload(request, property), images: [...existingImages, ...uploadedImages] });
        await property.save();
        response.json(property);
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
});

app.delete("/api/properties/:id", requireAdmin, async (request, response) => {
    try {
        const property = await Property.findByIdAndDelete(request.params.id);
        if (!property) return response.status(404).json({ error: "Property not found." });
        response.json({ ok: true });
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
});

app.get("*", (_request, response) => {
    response.sendFile(path.join(__dirname, "public", "index.html"));
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        app.listen(port, () => console.log(`Vynaro admin panel: http://localhost:${port}`));
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    });
