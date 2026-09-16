from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime

from database import get_db
from models import TransportProvider, TransportBooking, Deal, User, Notification
from schemas import (
    MatchRequest, MatchResponse, ProviderOption, LocationPoint,
    RouteRequest, RouteResponse,
    BookTransportRequest, BookTransportResponse, StatusUpdateRequest,
    AIRecommendationRequest, AIRecommendationResponse
)
from services.osrm import calculate_route, haversine_distance
from services.gemini import get_ai_recommendation

router = APIRouter(prefix="/api/logistics", tags=["logistics"])

@router.post("/match", response_model=MatchResponse)
def match_transporters(payload: MatchRequest, db: Session = Depends(get_db)):
    """
    Find suitable transport options based on location, crop quantity payload capacity, and availability.
    Calculates road distance via OSRM (or Haversine fallback) and computes estimated freight costs.
    """
    deal = db.query(Deal).filter(Deal.id == payload.deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail=f"Deal '{payload.deal_id}' not found.")
        
    if deal.deal_status != "ACCEPTED":
        raise HTTPException(
            status_code=400,
            detail=f"Deal status is '{deal.deal_status}'. Transport process requires deal status 'ACCEPTED'."
        )

    farmer = db.query(User).filter(User.id == deal.farmer_id).first()
    factory = db.query(User).filter(User.id == deal.buyer_id).first()

    farmer_lat = payload.farmer_lat or (farmer.latitude if farmer else 16.506)
    farmer_lng = payload.farmer_lng or (farmer.longitude if farmer else 80.648)
    factory_lat = payload.factory_lat or (factory.latitude if factory else 16.518)
    factory_lng = payload.factory_lng or (factory.longitude if factory else 80.619)
    radius_km = payload.search_radius_km or 50.0

    # 1. Calculate road distance from farmer to factory using OSRM
    route_info = calculate_route(farmer_lat, farmer_lng, factory_lat, factory_lng)
    route_distance_km = route_info["distance_km"]
    estimated_duration = route_info["duration_str"]
    is_fallback = route_info["is_fallback"]

    # 2. Query available transport providers where capacity_kg >= payload.quantity_kg
    providers = db.query(TransportProvider).filter(
        TransportProvider.availability_status == "AVAILABLE",
        TransportProvider.capacity_kg >= payload.quantity_kg
    ).all()

    options: List[ProviderOption] = []
    for p in providers:
        dist_from_farmer = haversine_distance(p.latitude, p.longitude, farmer_lat, farmer_lng)
        dist_from_factory = haversine_distance(p.latitude, p.longitude, factory_lat, factory_lng)

        # Proximity filter: must be within radius of EITHER farmer or factory hub
        min_hub_dist = min(dist_from_farmer, dist_from_factory)
        if min_hub_dist > radius_km:
            continue

        hub_tag = "Near Farmer Pickup (Gudivada)" if dist_from_farmer <= dist_from_factory else "Near Factory Hub (Vijayawada)"

        base = p.base_cost or 0.0
        est_cost = round(base + (route_distance_km * p.rate_per_km), 2)
        cost_per_kg = round(est_cost / payload.quantity_kg, 2)

        options.append(ProviderOption(
            id=p.id,
            name=p.name,
            verified=p.verified,
            vehicle_type=p.vehicle_type,
            vehicle_number=p.vehicle_number,
            capacity_kg=p.capacity_kg,
            distance_from_farmer_km=dist_from_farmer,
            distance_from_factory_km=dist_from_factory,
            hub_location_tag=hub_tag,
            estimated_cost=est_cost,
            estimated_cost_per_kg=cost_per_kg,
            cost_per_kg=cost_per_kg,
            rate_per_km=p.rate_per_km,
            availability=p.availability_status,
            latitude=p.latitude,
            longitude=p.longitude,
            phone=p.phone,
            rating=p.rating,
            is_demo_mock_data=True
        ))

    # Sort options by distance from farmer and estimated cost
    options.sort(key=lambda x: (x.distance_from_farmer_km, x.estimated_cost))

    pickup_pt = LocationPoint(
        farmer_name=farmer.name if farmer else "Farmer Pickup",
        address=farmer.address if farmer else "Krishna District, AP",
        latitude=farmer_lat,
        longitude=farmer_lng
    )

    delivery_pt = LocationPoint(
        factory_name=factory.name if factory else "Factory Delivery",
        address=factory.address if factory else "Auto Nagar, Vijayawada, AP",
        latitude=factory_lat,
        longitude=factory_lng
    )

    return MatchResponse(
        success=True,
        deal_id=payload.deal_id,
        crop=payload.crop,
        quantity_kg=payload.quantity_kg,
        pickup=pickup_pt,
        delivery=delivery_pt,
        distance_km=route_distance_km,
        estimated_duration=estimated_duration,
        is_fallback_distance=is_fallback,
        search_radius_km=radius_km,
        transport_options=options
    )

@router.post("/route", response_model=RouteResponse)
def get_route(payload: RouteRequest):
    """
    Calculate OSRM road distance, duration, and return polyline coordinates for map drawing.
    """
    route_info = calculate_route(payload.pickup_lat, payload.pickup_lng, payload.delivery_lat, payload.delivery_lng)
    return RouteResponse(
        success=True,
        distance_km=route_info["distance_km"],
        duration_minutes=route_info["duration_minutes"],
        duration_str=route_info["duration_str"],
        is_fallback=route_info["is_fallback"],
        route=route_info["polyline_coords"]
    )

@router.get("/providers")
def get_providers(db: Session = Depends(get_db)):
    """Return all registered transport providers in the database."""
    return db.query(TransportProvider).all()

@router.get("/providers/nearby")
def get_nearby_providers(
    lat: float = Query(16.506, description="Center latitude"),
    lng: float = Query(80.648, description="Center longitude"),
    radius_km: float = Query(25.0, description="Search radius in kilometers"),
    min_capacity_kg: Optional[float] = Query(None, description="Minimum payload capacity required"),
    db: Session = Depends(get_db)
):
    """Search available transport providers within a radius of given coordinates."""
    query = db.query(TransportProvider).filter(TransportProvider.availability_status == "AVAILABLE")
    if min_capacity_kg:
        query = query.filter(TransportProvider.capacity_kg >= min_capacity_kg)
    
    providers = query.all()
    results = []
    for p in providers:
        dist = haversine_distance(p.latitude, p.longitude, lat, lng)
        if dist <= radius_km:
            results.append({
                "id": p.id,
                "name": p.name,
                "vehicle_type": p.vehicle_type,
                "vehicle_number": p.vehicle_number,
                "capacity_kg": p.capacity_kg,
                "distance_km": dist,
                "rate_per_km": p.rate_per_km,
                "verified": p.verified,
                "rating": p.rating,
                "latitude": p.latitude,
                "longitude": p.longitude
            })

    results.sort(key=lambda x: x["distance_km"])
    return {"success": True, "count": len(results), "providers": results}

@router.post("/book", response_model=BookTransportResponse)
def book_transport(payload: BookTransportRequest, db: Session = Depends(get_db)):
    """
    Create a new TransportBooking record.
    1. Verifies deal status = 'ACCEPTED'.
    2. Verifies provider availability = 'AVAILABLE'.
    3. Verifies provider capacity >= crop quantity.
    4. Sets booking status to 'BOOKED' and provider to 'ASSIGNED'.
    """
    deal = db.query(Deal).filter(Deal.id == payload.deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail=f"Deal '{payload.deal_id}' not found.")

    if deal.deal_status != "ACCEPTED":
        raise HTTPException(status_code=400, detail=f"Deal status is '{deal.deal_status}'. Must be 'ACCEPTED' to book transport.")

    provider = db.query(TransportProvider).filter(TransportProvider.id == payload.transport_provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Transport provider not found.")

    if provider.capacity_kg < payload.quantity_kg:
        raise HTTPException(
            status_code=400,
            detail=f"Vehicle capacity ({provider.capacity_kg:,.0f} kg) is smaller than shipment ({payload.quantity_kg:,.0f} kg)."
        )

    # Check if existing booking exists
    existing = db.query(TransportBooking).filter(TransportBooking.deal_id == payload.deal_id).first()
    if existing and existing.booking_status not in ["CANCELLED"]:
        return format_book_response(existing, db)

    booking = TransportBooking(
        deal_id=payload.deal_id,
        transport_provider_id=payload.transport_provider_id,
        farmer_id=payload.farmer_id or deal.farmer_id,
        buyer_id=payload.buyer_id or deal.buyer_id,
        crop=payload.crop,
        quantity_kg=payload.quantity_kg,
        pickup_lat=payload.pickup_lat or 16.506,
        pickup_lng=payload.pickup_lng or 80.648,
        pickup_address=payload.pickup_address or "Farmer Location",
        delivery_lat=payload.delivery_lat or 16.518,
        delivery_lng=payload.delivery_lng or 80.619,
        delivery_address=payload.delivery_address or "Factory Location",
        distance_km=payload.distance_km or 5.1,
        estimated_duration=payload.estimated_duration or "6 min",
        estimated_cost=payload.estimated_cost or 280.5,
        cost_per_kg=payload.cost_per_kg or 0.14,
        booking_status="BOOKED",
        is_fallback_distance=payload.is_fallback_distance
    )

    provider.availability_status = "ASSIGNED"

    n1 = Notification(
        user_id=booking.farmer_id,
        role="FARMER",
        title="Transport Booked",
        message=f"Transport booked successfully with {provider.name} ({provider.vehicle_type})."
    )
    n2 = Notification(
        user_id=booking.buyer_id,
        role="BUYER",
        title="Transport Arranged",
        message=f"Transport arranged for your incoming {payload.crop} shipment."
    )
    n3 = Notification(
        user_id=payload.transport_provider_id,
        role="TRANSPORTER",
        title="New Transport Assignment",
        message=f"New transport assignment for {payload.quantity_kg:,.0f} kg {payload.crop}."
    )

    db.add(booking)
    db.add_all([n1, n2, n3])
    db.commit()
    db.refresh(booking)

    return format_book_response(booking, db)

@router.get("/booking/{booking_id}")
def get_booking(booking_id: str, db: Session = Depends(get_db)):
    """Fetch booking details by booking ID."""
    booking = db.query(TransportBooking).filter(TransportBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Transport booking not found")
    return format_book_response(booking, db)

@router.get("/deal/{deal_id}")
def get_booking_by_deal(deal_id: str, db: Session = Depends(get_db)):
    """Fetch booking for a specific deal ID."""
    booking = db.query(TransportBooking).filter(TransportBooking.deal_id == deal_id).first()
    if not booking:
        return {"found": False, "booking": None}
    return {"found": True, "booking": format_book_response(booking, db)}

@router.patch("/booking/{booking_id}/status")
def update_booking_status(booking_id: str, payload: StatusUpdateRequest, db: Session = Depends(get_db)):
    """Update shipment status: SEARCHING -> BOOKED -> PICKUP_ASSIGNED -> PICKED_UP -> IN_TRANSIT -> DELIVERED."""
    booking = db.query(TransportBooking).filter(TransportBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    new_status = payload.status.upper()
    valid_statuses = ["SEARCHING", "AVAILABLE", "BOOKED", "PICKUP_ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status '{new_status}'. Allowed: {valid_statuses}")

    booking.booking_status = new_status
    booking.updated_at = datetime.datetime.utcnow()

    provider = db.query(TransportProvider).filter(TransportProvider.id == booking.transport_provider_id).first()

    if new_status == "PICKED_UP":
        db.add(Notification(user_id=booking.farmer_id, role="FARMER", title="Crop Picked Up", message=f"Your {booking.crop} crop has been picked up by {provider.name if provider else 'Transporter'}."))
        db.add(Notification(user_id=booking.buyer_id, role="BUYER", title="Shipment In Transit", message=f"Your shipment of {booking.crop} is now in transit."))
    elif new_status == "DELIVERED":
        if provider:
            provider.availability_status = "AVAILABLE"
        db.add(Notification(user_id=booking.farmer_id, role="FARMER", title="Crop Delivered", message=f"Your {booking.crop} crop delivered successfully to factory."))
        db.add(Notification(user_id=booking.buyer_id, role="BUYER", title="Shipment Delivered", message=f"Shipment of {booking.crop} delivered successfully!"))

    db.commit()
    db.refresh(booking)
    return format_book_response(booking, db)

@router.post("/recommend-ai", response_model=AIRecommendationResponse)
def recommend_ai(payload: AIRecommendationRequest):
    """
    Server-side Gemini AI decision recommendation endpoint.
    Analyzes actual available transporter data supplied to it and returns structured recommendation.
    """
    res = get_ai_recommendation(
        crop=payload.crop,
        quantity_kg=payload.quantity_kg,
        farmer_address=payload.farmer_address,
        factory_address=payload.factory_address,
        options=payload.options
    )
    return res

@router.get("/farmer/{farmer_id}")
def get_farmer_bookings(farmer_id: str, db: Session = Depends(get_db)):
    """Get all transport bookings for a farmer."""
    bookings = db.query(TransportBooking).filter(TransportBooking.farmer_id == farmer_id).all()
    return [format_book_response(b, db) for b in bookings]

@router.get("/buyer/{buyer_id}")
def get_buyer_bookings(buyer_id: str, db: Session = Depends(get_db)):
    """Get all transport bookings for a buyer/factory."""
    bookings = db.query(TransportBooking).filter(TransportBooking.buyer_id == buyer_id).all()
    return [format_book_response(b, db) for b in bookings]

@router.get("/transporter/{transporter_id}")
def get_transporter_bookings(transporter_id: str, db: Session = Depends(get_db)):
    """Get all jobs assigned to a specific transport provider."""
    bookings = db.query(TransportBooking).filter(TransportBooking.transport_provider_id == transporter_id).all()
    return [format_book_response(b, db) for b in bookings]

def format_book_response(booking: TransportBooking, db: Session):
    provider = db.query(TransportProvider).filter(TransportProvider.id == booking.transport_provider_id).first()
    farmer = db.query(User).filter(User.id == booking.farmer_id).first()
    buyer = db.query(User).filter(User.id == booking.buyer_id).first()

    return BookTransportResponse(
        success=True,
        booking_id=booking.id,
        deal_id=booking.deal_id,
        status=booking.booking_status,
        provider=provider.name if provider else "Transporter",
        vehicle=f"{provider.vehicle_type} ({provider.vehicle_number})" if provider else "Truck",
        crop=booking.crop,
        quantity_kg=booking.quantity_kg,
        estimated_cost=booking.estimated_cost,
        cost_per_kg=booking.cost_per_kg,
        distance_km=booking.distance_km,
        created_at=booking.created_at,
        updated_at=booking.updated_at,
        booking_details={
            "id": booking.id,
            "deal_id": booking.deal_id,
            "transport_provider_id": booking.transport_provider_id,
            "farmer_id": booking.farmer_id,
            "buyer_id": booking.buyer_id,
            "crop": booking.crop,
            "quantity_kg": booking.quantity_kg,
            "pickup_lat": booking.pickup_lat,
            "pickup_lng": booking.pickup_lng,
            "pickup_address": booking.pickup_address,
            "delivery_lat": booking.delivery_lat,
            "delivery_lng": booking.delivery_lng,
            "delivery_address": booking.delivery_address,
            "distance_km": booking.distance_km,
            "estimated_duration": booking.estimated_duration,
            "estimated_cost": booking.estimated_cost,
            "cost_per_kg": booking.cost_per_kg,
            "booking_status": booking.booking_status,
            "is_fallback_distance": booking.is_fallback_distance,
            "provider": {
                "id": provider.id,
                "name": provider.name,
                "phone": provider.phone,
                "vehicle_type": provider.vehicle_type,
                "vehicle_number": provider.vehicle_number,
                "capacity_kg": provider.capacity_kg,
                "verified": provider.verified,
                "rating": provider.rating,
                "latitude": provider.latitude,
                "longitude": provider.longitude
            } if provider else None,
            "farmer": {
                "id": farmer.id,
                "name": farmer.name,
                "phone": farmer.phone,
                "address": farmer.address
            } if farmer else None,
            "buyer": {
                "id": buyer.id,
                "name": buyer.name,
                "phone": buyer.phone,
                "address": buyer.address
            } if buyer else None
        }
    )
