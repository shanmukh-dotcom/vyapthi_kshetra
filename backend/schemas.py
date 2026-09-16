from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ==========================================
# 1. LOGISTICS & MATCH SCHEMAS
# ==========================================

class MatchRequest(BaseModel):
    deal_id: str = Field(..., example="deal_potato_88")
    farmer_lat: float = Field(..., example=16.506)
    farmer_lng: float = Field(..., example=80.648)
    factory_lat: float = Field(..., example=16.518)
    factory_lng: float = Field(..., example=80.619)
    crop: str = Field(..., example="Potato")
    quantity_kg: float = Field(..., example=2000.0)
    search_radius_km: Optional[float] = Field(50.0, example=50.0)

class LocationPoint(BaseModel):
    farmer_name: Optional[str] = "Farmer Pickup"
    factory_name: Optional[str] = "Factory Delivery"
    address: Optional[str] = None
    latitude: float
    longitude: float

class ProviderOption(BaseModel):
    id: str
    name: str
    verified: bool = True
    vehicle_type: str
    vehicle_number: str
    capacity_kg: float
    distance_from_farmer_km: float
    distance_from_factory_km: float
    hub_location_tag: str
    estimated_cost: float
    estimated_cost_per_kg: float
    cost_per_kg: Optional[float] = None
    rate_per_km: Optional[float] = None
    availability: str = "AVAILABLE"
    latitude: float
    longitude: float
    phone: str
    rating: float = 4.8
    is_demo_mock_data: bool = True

class MatchResponse(BaseModel):
    success: bool = True
    deal_id: str
    crop: str
    quantity_kg: float
    pickup: LocationPoint
    delivery: LocationPoint
    distance_km: float
    estimated_duration: str
    is_fallback_distance: bool
    search_radius_km: float
    transport_options: List[ProviderOption]

# ==========================================
# 2. ROUTE SCHEMAS
# ==========================================

class RouteRequest(BaseModel):
    pickup_lat: float = Field(..., example=16.506)
    pickup_lng: float = Field(..., example=80.648)
    delivery_lat: float = Field(..., example=16.518)
    delivery_lng: float = Field(..., example=80.619)

class RouteResponse(BaseModel):
    success: bool = True
    distance_km: float
    duration_minutes: int
    duration_str: str
    is_fallback: bool
    route: List[List[float]]  # List of [lat, lon] pairs

# ==========================================
# 3. BOOKING SCHEMAS
# ==========================================

class BookTransportRequest(BaseModel):
    deal_id: str = Field(..., example="deal_potato_88")
    transport_provider_id: str = Field(..., example="tp_001")
    farmer_id: Optional[str] = "usr_farmer_101"
    buyer_id: Optional[str] = "usr_buyer_201"
    crop: str = Field(..., example="Potato")
    quantity_kg: float = Field(..., example=2000.0)
    pickup_lat: Optional[float] = 16.506
    pickup_lng: Optional[float] = 80.648
    pickup_address: Optional[str] = "Gudivada Road, Krishna District"
    delivery_lat: Optional[float] = 16.518
    delivery_lng: Optional[float] = 80.619
    delivery_address: Optional[str] = "Auto Nagar Industrial Park, Vijayawada"
    distance_km: Optional[float] = 5.1
    estimated_duration: Optional[str] = "6 min"
    estimated_cost: Optional[float] = 280.5
    cost_per_kg: Optional[float] = 0.14
    is_fallback_distance: bool = False

class BookTransportResponse(BaseModel):
    success: bool = True
    booking_id: str
    deal_id: str
    status: str
    provider: str
    vehicle: str
    crop: str
    quantity_kg: float
    estimated_cost: float
    cost_per_kg: float
    distance_km: float
    created_at: datetime
    updated_at: datetime
    booking_details: Dict[str, Any]

class StatusUpdateRequest(BaseModel):
    status: str

# ==========================================
# 4. DEAL SCHEMAS
# ==========================================

class DealCreateRequest(BaseModel):
    listing_id: str
    buyer_id: str
    deal_price: float

class DealAcceptRequest(BaseModel):
    user_role: str  # FARMER or BUYER

# ==========================================
# 5. GEMINI AI RECOMMENDATION SCHEMAS
# ==========================================

class AIRecommendationRequest(BaseModel):
    deal_id: str
    crop: str
    quantity_kg: float
    farmer_address: str
    factory_address: str
    options: List[Dict[str, Any]]

class AIRecommendationResponse(BaseModel):
    recommended_transporter_id: Optional[str]
    reason: str
    why_points: List[str]
    alternative_ids: List[str]
    warnings: List[str]

# ==========================================
# 6. POTATO AI / RAG MODULE SCHEMAS
# ==========================================

class PotatoAnalyzeRequest(BaseModel):
    crop: str = Field("Potato", example="Potato")
    quantity_kg: float = Field(..., example=2000.0)
    sample_image_url: Optional[str] = None
    batch_notes: Optional[str] = "Fresh harvest batch from Krishna District"

class PotatoAnalyzeResponse(BaseModel):
    success: bool = True
    crop: str
    quantity_kg: float
    quality_grade: str  # Grade A, Grade B, Grade C
    quality_score: float  # e.g., 94.5%
    defect_analysis: List[str]
    pricing_recommendation_per_kg: float
    rag_knowledge_summary: str
    analyzed_at: datetime
