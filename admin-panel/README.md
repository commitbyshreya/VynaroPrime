# Vynaro Prime Admin Panel

A small Node.js + Express + MongoDB admin application for managing Buy, Projects, Commercial, and Luxury listings.

## Setup

1. Enter the `admin-panel` directory.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `MONGODB_URI` to the provided MongoDB connection string and choose a private `ADMIN_KEY`.
5. Start with `npm run dev`.
6. Open `http://localhost:8787`.

The MongoDB connection string is intentionally read from `.env` and is not committed to the repository.

## Listing fields

The admin form supports category, listing type, name, location, price, BHK, built-up area, furnishing, description, amenity checkboxes, up to 12 images, featured state, and published state. Prices are normalized to a consistent `₹... Cr` or `₹... Lac` display format, and BHK, area, and furnishing are combined into the storefront metadata line. Uploaded files are stored in `admin-panel/uploads` and listing records are stored in MongoDB.

## Storefront integration

The storefront fetches `/api/properties/public` on load. Published records are placed into their matching Buy, Projects, Commercial, or Luxury collection, and uploaded image paths are resolved through the admin server. Demo listings remain as fallback content when the admin server is unavailable.
