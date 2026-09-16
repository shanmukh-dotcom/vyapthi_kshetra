# Vyapti Kshetra — Logistics & Transport API Reference

This document provides complete technical specifications for the **Vyapti Kshetra Transport & Logistics API Engine**.

---

## 📌 General Information

- **Development Base URL**: `http://localhost:8000`
- **Swagger Interactive Documentation**: `http://localhost:8000/docs`
- **OpenAPI Schema Specification**: `http://localhost:8000/openapi.json`
- **Authentication**: Secret API keys (`GEMINI_API_KEY`, `TRANSPORT_API_KEY`) are managed strictly server-side in `backend/.env`.

---

## 🚀 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/logistics/match` | Dual-hub transport provider matching & cost estimation |
| `POST` | `/api/logistics/route` | OSRM road distance, travel time & polyline route calculation |
| `GET` | `/api/logistics/providers` | List all registered transport providers |
| `GET` | `/api/logistics/providers/nearby` | Radius search for nearby providers around lat/lng |
| `POST` | `/api/logistics/book` | Create transport booking & set status to `BOOKED` |
| `GET` | `/api/logistics/booking/{booking_id}` | Fetch booking details by booking ID |
| `GET` | `/api/logistics/deal/{deal_id}` | Fetch transport booking associated with a deal |
| `PATCH` | `/api/logistics/booking/{booking_id}/status` | Transition shipment status (`PICKED_UP`, `IN_TRANSIT`, `DELIVERED`) |
| `POST` | `/api/logistics/recommend-ai` | Server-side Gemini AI decision recommendation engine |
| `POST` | `/api/potato/analyze` | Modular Potato AI Vision & Crop Quality Grading API |

---

## 1. Transport Match API

### `POST /api/logistics/match`
Matches suitable available transport providers near both Farmer Pickup and Factory Delivery hubs.

#### Request JSON:
```json
{
  "deal_id": "deal_potato_88",
  "farmer_lat": 16.506,
  "farmer_lng": 80.648,
  "factory_lat": 16.518,
  "factory_lng": 80.619,
  "crop": "Potato",
  "quantity_kg": 2000,
  "search_radius_km": 50.0
}
```

#### Response JSON (`200 OK`):
```json
{
  "success": true,
  "deal_id": "deal_potato_88",
  "crop": "Potato",
  "quantity_kg": 2000.0,
  "pickup": {
    "farmer_name": "Rambabu (Farmer)",
    "address": "Gudivada Road, Krishna District, AP",
    "latitude": 16.506,
    "longitude": 80.648
  },
  "delivery": {
    "factory_name": "Vijayawada Agro Processing Factory",
    "address": "Auto Nagar Industrial Park, Vijayawada, AP",
    "latitude": 16.518,
    "longitude": 80.619
  },
  "distance_km": 5.1,
  "estimated_duration": "6 min",
  "is_fallback_distance": false,
  "search_radius_km": 50.0,
  "transport_options": [
    {
      "id": "tp_004",
      "name": "Mathrusri Logistics",
      "verified": true,
      "vehicle_type": "14-ft Eicher",
      "vehicle_number": "AP 16 TX 7750",
      "capacity_kg": 3500.0,
      "distance_from_farmer_km": 0.96,
      "distance_from_factory_km": 2.92,
      "hub_location_tag": "Near Farmer Pickup (Gudivada)",
      "estimated_cost": 265.2,
      "estimated_cost_per_kg": 0.13,
      "availability": "AVAILABLE",
      "latitude": 16.502,
      "longitude": 80.64,
      "phone": "+91 93939 11223",
      "rating": 4.7,
      "is_demo_mock_data": true
    }
  ]
}
```

---

## 2. Transport Route API

### `POST /api/logistics/route`
Returns road distance, travel duration, and Leaflet polyline coordinates.

#### Request JSON:
```json
{
  "pickup_lat": 16.506,
  "pickup_lng": 80.648,
  "delivery_lat": 16.518,
  "delivery_lng": 80.619
}
```

#### Response JSON (`200 OK`):
```json
{
  "success": true,
  "distance_km": 5.1,
  "duration_minutes": 6,
  "duration_str": "6 min",
  "is_fallback": false,
  "route": [
    [16.506, 80.648],
    [16.510, 80.635],
    [16.518, 80.619]
  ]
}
```

---

## 3. Transport Booking API

### `POST /api/logistics/book`
Verifies deal status and creates a new `TransportBooking` record.

#### Request JSON:
```json
{
  "deal_id": "deal_potato_88",
  "transport_provider_id": "tp_001",
  "farmer_id": "usr_farmer_101",
  "buyer_id": "usr_buyer_201",
  "crop": "Potato",
  "quantity_kg": 2000,
  "estimated_cost": 280.5
}
```

#### Response JSON (`200 OK`):
```json
{
  "success": true,
  "booking_id": "c1f7a08b-4b2e-419b-a312-32a514890011",
  "deal_id": "deal_potato_88",
  "status": "BOOKED",
  "provider": "Sri Panduranga Lorry Transport",
  "vehicle": "14-ft Eicher (AP 16 TH 4582)",
  "crop": "Potato",
  "quantity_kg": 2000.0,
  "estimated_cost": 280.5,
  "cost_per_kg": 0.14,
  "distance_km": 5.1,
  "created_at": "2026-09-16T15:00:00Z",
  "updated_at": "2026-09-16T15:00:00Z",
  "booking_details": { ... }
}
```

---

## 4. Gemini AI Recommendation API

### `POST /api/logistics/recommend-ai`

#### Request JSON:
```json
{
  "deal_id": "deal_potato_88",
  "crop": "Potato",
  "quantity_kg": 2000,
  "farmer_address": "Gudivada Road, Krishna District",
  "factory_address": "Vijayawada Factory",
  "options": [ ... ]
}
```

#### Response JSON (`200 OK`):
```json
{
  "recommended_transporter_id": "tp_001",
  "reason": "Based on vehicle payload capacity (3,500 kg), pickup proximity (1.4 km), and total freight cost (280), Sri Panduranga Lorry Transport is the most optimal recommendation.",
  "why_points": [
    "Sufficient vehicle payload capacity (3,500 kg capacity >= 2,000 kg crop load)",
    "Closest available fleet vehicle (1.4 km from farmer pickup)",
    "Economical transport freight rate (₹281 total / ₹0.14/kg)",
    "Verified carrier with 4.9★ rating and active availability"
  ],
  "alternative_ids": ["tp_004", "tp_002"],
  "warnings": []
}
```

---

## 5. Modular Potato AI API

### `POST /api/potato/analyze`

#### Request JSON:
```json
{
  "crop": "Potato",
  "quantity_kg": 2000,
  "batch_notes": "Fresh harvest batch from Krishna District"
}
```

#### Response JSON (`200 OK`):
```json
{
  "success": true,
  "crop": "Potato",
  "quantity_kg": 2000.0,
  "quality_grade": "Grade A",
  "quality_score": 94.5,
  "defect_analysis": [
    "Minor surface soil residue",
    "Zero sprouting detected",
    "Uniform size distribution (60-80mm)"
  ],
  "pricing_recommendation_per_kg": 25.0,
  "rag_knowledge_summary": "Analyzed 2,000 kg Potato consignment. Quality Grade: Grade A (94.5% score). Optimal recommended farm gate price is ₹25.00/kg.",
  "analyzed_at": "2026-09-16T15:00:00Z"
}
```

---

## 🔒 Security & Environment Setup

Configure your `backend/.env` file:

```env
# Gemini AI Key
GEMINI_API_KEY=AIzaSy...

# Optional External Transport API Key
TRANSPORT_API_KEY=sk_transport_live_key_here

# Allowed CORS Origins for Frontend Integration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000
```
