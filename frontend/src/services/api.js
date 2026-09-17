const API_BASE = "https://vyapthi-kshetra-backend.onrender.com/api";

export async function matchTransporters(matchData) {
  const res = await fetch(`${API_BASE}/logistics/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(matchData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to match transport providers.");
  }
  const raw = await res.json();

  // Normalize backend response to frontend-expected shape
  const options = (raw.transport_options || []).map((opt) => ({
    ...opt,
    cost_per_kg: opt.estimated_cost_per_kg ?? opt.cost_per_kg ?? 0,
    rate_per_km: opt.rate_per_km ?? 0,
    eta_minutes: opt.eta_minutes ?? Math.round((opt.distance_from_farmer_km || 5) * 3),
    route_distance_km: raw.distance_km ?? 5.1,
  }));

  return {
    ...raw,
    options,
    deal_id: raw.deal_id,
    crop: raw.crop,
    quantity_kg: raw.quantity_kg,
    farmer_lat: raw.pickup?.latitude ?? matchData.farmer_lat,
    farmer_lng: raw.pickup?.longitude ?? matchData.farmer_lng,
    farmer_name: raw.pickup?.farmer_name ?? "Farmer Pickup",
    farmer_address: raw.pickup?.address ?? "Krishna District, AP",
    factory_lat: raw.delivery?.latitude ?? matchData.factory_lat,
    factory_lng: raw.delivery?.longitude ?? matchData.factory_lng,
    factory_name: raw.delivery?.factory_name ?? "Factory Delivery",
    factory_address: raw.delivery?.address ?? "Auto Nagar, Vijayawada, AP",
    route_distance_km: raw.distance_km,
    estimated_duration: raw.estimated_duration,
    is_fallback_distance: raw.is_fallback_distance,
    search_radius_km: raw.search_radius_km,
  };
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

export async function getProviders() {
  const res = await fetch(`${API_BASE}/logistics/providers`);
  return res.json();
}

function normalizeBooking(raw) {
  const details = raw.booking_details || {};
  return {
    ...raw,
    id: raw.booking_id || details.id || raw.id,
    booking_status: raw.status || details.booking_status || "BOOKED",
    pickup_lat: details.pickup_lat,
    pickup_lng: details.pickup_lng,
    pickup_address: details.pickup_address,
    delivery_lat: details.delivery_lat,
    delivery_lng: details.delivery_lng,
    delivery_address: details.delivery_address,
    estimated_duration: details.estimated_duration,
    provider: details.provider || null,
    farmer: details.farmer || null,
    buyer: details.buyer || null,
  };
}

export async function bookTransport(bookingData) {
  const res = await fetch(`${API_BASE}/logistics/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to book transport.");
  }
  const raw = await res.json();
  return normalizeBooking(raw);
}

export async function getBookingByDeal(dealId) {
  const res = await fetch(`${API_BASE}/logistics/deal/${dealId}`);
  const data = await res.json();
  if (data.found && data.booking) {
    return { found: true, booking: normalizeBooking(data.booking) };
  }
  return data;
}

export async function updateBookingStatus(bookingId, status) {
  const res = await fetch(`${API_BASE}/logistics/booking/${bookingId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to update booking status.");
  }
  const raw = await res.json();
  return normalizeBooking(raw);
}

export async function getFarmerBookings(farmerId) {
  const res = await fetch(`${API_BASE}/logistics/farmer/${farmerId}`);
  return res.json();
}

export async function getBuyerBookings(buyerId) {
  const res = await fetch(`${API_BASE}/logistics/buyer/${buyerId}`);
  return res.json();
}

export async function getTransporterBookings(transporterId) {
  const res = await fetch(`${API_BASE}/logistics/transporter/${transporterId}`);
  return res.json();
}

export async function getListings() {
  const res = await fetch(`${API_BASE}/deals/listings`);
  return res.json();
}

export async function createOffer(data) {
  const res = await fetch(`${API_BASE}/deals/create-offer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function acceptDeal(dealId, userRole) {
  const res = await fetch(`${API_BASE}/deals/${dealId}/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_role: userRole }),
  });
  return res.json();
}

export async function getNotifications(userId) {
  const res = await fetch(`${API_BASE}/auth/notifications/${userId}`);
  return res.json();
}
