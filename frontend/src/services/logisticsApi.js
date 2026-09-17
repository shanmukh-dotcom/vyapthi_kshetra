// Vyapti Kshetra — Frontend Logistics API Service
// Wraps FastAPI backend endpoints securely without exposing API keys

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://vyapthi-kshetra-backend.onrender.com/api";

export async function matchTransporters(payload) {
  const res = await fetch(`${API_BASE}/logistics/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to match transport options.");
  }
  return res.json();
}

export async function getRoute(payload) {
  const res = await fetch(`${API_BASE}/logistics/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to calculate route.");
  }
  return res.json();
}

export async function bookTransport(payload) {
  const res = await fetch(`${API_BASE}/logistics/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create transport booking.");
  }
  return res.json();
}

export async function getBooking(bookingId) {
  const res = await fetch(`${API_BASE}/logistics/booking/${bookingId}`);
  return res.json();
}

export async function updateBookingStatus(bookingId, status) {
  const res = await fetch(`${API_BASE}/logistics/booking/${bookingId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to update shipment status.");
  }
  return res.json();
}

export async function getAIRecommendation(payload) {
  const res = await fetch(`${API_BASE}/logistics/recommend-ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to fetch AI recommendation.");
  }
  return res.json();
}

export async function analyzePotato(payload) {
  const res = await fetch(`${API_BASE}/potato/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}
