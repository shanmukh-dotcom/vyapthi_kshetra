# Vyapti Kshetra — Team Integration Guide

This guide explains how developers working on separate laptops or client applications can integrate with the **Vyapti Kshetra Logistics & AI Backend Engine**.

---

## 🔗 Architecture Overview

```
 [Other Developer Laptop]                  [FastAPI Backend Engine]
┌────────────────────────┐                ┌────────────────────────┐
│ Next.js / React App    │ ──────────────>│ FastAPI @ Port 8000    │
│                        │                │                        │
│ POST /api/logistics/*  │ <──────────────│ Handles Matching, OSRM,│
│ POST /api/potato/*     │                │ Gemini AI & Database   │
└────────────────────────┘                └────────────────────────┘
```

The main application consumes clean REST endpoints **without duplicating or copying the internal transport or AI algorithms**.

---

## 1. Environment Variable Setup (On Your Laptop)

Add the backend API URL to your frontend environment file (`.env.local` for Next.js or `.env` for Vite):

```env
# Development Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Production Base URL (When deployed)
# NEXT_PUBLIC_API_BASE_URL=https://api.vyaptikshetra.in
```

---

## 2. Integration Code Snippets

### A. Automatic Transport Matching (`POST /api/logistics/match`)

Call this endpoint as soon as both Farmer and Buyer accept a crop deal:

```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function matchLogisticsForDeal(dealData) {
  const response = await fetch(`${API_BASE}/api/logistics/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deal_id: dealData.id,
      farmer_lat: dealData.farmer_lat,
      farmer_lng: dealData.farmer_lng,
      factory_lat: dealData.factory_lat,
      factory_lng: dealData.factory_lng,
      crop: dealData.crop_name,
      quantity_kg: dealData.quantity_kg,
      search_radius_km: 50.0
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Matching failed");
  return data;
}
```

### B. Route Polyline for Leaflet / OpenStreetMap (`POST /api/logistics/route`)

```javascript
export async function getRoutePolyline(pickupLat, pickupLng, deliveryLat, deliveryLng) {
  const res = await fetch(`${API_BASE}/api/logistics/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pickup_lat: pickupLat,
      pickup_lng: pickupLng,
      delivery_lat: deliveryLat,
      delivery_lng: deliveryLng
    })
  });
  return res.json();
}
```

### C. Booking Transport (`POST /api/logistics/book`)

```javascript
export async function confirmTransportBooking(bookingPayload) {
  const res = await fetch(`${API_BASE}/api/logistics/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deal_id: bookingPayload.deal_id,
      transport_provider_id: bookingPayload.provider_id,
      crop: bookingPayload.crop,
      quantity_kg: bookingPayload.quantity_kg,
      estimated_cost: bookingPayload.estimated_cost
    })
  });
  return res.json();
}
```

### D. Potato AI Vision & Crop Analysis (`POST /api/potato/analyze`)

```javascript
export async function analyzePotatoCrop(cropSpecs) {
  const res = await fetch(`${API_BASE}/api/potato/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      crop: "Potato",
      quantity_kg: cropSpecs.quantity_kg,
      batch_notes: cropSpecs.notes
    })
  });
  return res.json();
}
```

---

## 3. Testing via Swagger Interactive Docs

On your laptop, visit:
👉 **`http://localhost:8000/docs`**

You can execute queries, inspect request/response schemas, and test responses directly from the Swagger UI.
