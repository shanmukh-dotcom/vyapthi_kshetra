import datetime
import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # FARMER, BUYER, TRANSPORTER
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CropListing(Base):
    __tablename__ = "crop_listings"

    id = Column(String, primary_key=True, default=generate_uuid)
    farmer_id = Column(String, ForeignKey("users.id"), nullable=False)
    crop_name = Column(String, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    location_name = Column(String, nullable=False)
    farmer_lat = Column(Float, nullable=False)
    farmer_lng = Column(Float, nullable=False)
    status = Column(String, default="ACTIVE")  # ACTIVE, IN_DEAL, SOLD
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("User", foreign_keys=[farmer_id])

class Deal(Base):
    __tablename__ = "deals"

    id = Column(String, primary_key=True, default=generate_uuid)
    listing_id = Column(String, ForeignKey("crop_listings.id"), nullable=False)
    farmer_id = Column(String, ForeignKey("users.id"), nullable=False)
    buyer_id = Column(String, ForeignKey("users.id"), nullable=False)
    crop_name = Column(String, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    deal_price = Column(Float, nullable=False)
    farmer_accepted = Column(Boolean, default=False)
    buyer_accepted = Column(Boolean, default=False)
    deal_status = Column(String, default="OFFERED")  # CREATED, OFFERED, ACCEPTED, REJECTED
    accepted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    listing = relationship("CropListing", foreign_keys=[listing_id])
    farmer = relationship("User", foreign_keys=[farmer_id])
    buyer = relationship("User", foreign_keys=[buyer_id])

class TransportProvider(Base):
    __tablename__ = "transport_providers"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=True)
    vehicle_type = Column(String, nullable=False)
    vehicle_number = Column(String, nullable=False)
    capacity_kg = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    service_area = Column(String, default="Krishna District & Vijayawada")
    rate_per_km = Column(Float, nullable=False)
    base_cost = Column(Float, default=0.0)
    availability_status = Column(String, default="AVAILABLE")  # AVAILABLE, ASSIGNED, UNAVAILABLE
    verified = Column(Boolean, default=True)
    rating = Column(Float, default=4.8)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class TransportBooking(Base):
    __tablename__ = "transport_bookings"

    id = Column(String, primary_key=True, default=generate_uuid)
    deal_id = Column(String, ForeignKey("deals.id"), nullable=False)
    transport_provider_id = Column(String, ForeignKey("transport_providers.id"), nullable=False)
    farmer_id = Column(String, ForeignKey("users.id"), nullable=False)
    buyer_id = Column(String, ForeignKey("users.id"), nullable=False)
    crop = Column(String, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    
    pickup_lat = Column(Float, nullable=False)
    pickup_lng = Column(Float, nullable=False)
    pickup_address = Column(String, nullable=True)
    
    delivery_lat = Column(Float, nullable=False)
    delivery_lng = Column(Float, nullable=False)
    delivery_address = Column(String, nullable=True)
    
    distance_km = Column(Float, nullable=False)
    estimated_duration = Column(String, nullable=False)
    estimated_cost = Column(Float, nullable=False)
    cost_per_kg = Column(Float, nullable=False)
    
    # SEARCHING, AVAILABLE, BOOKED, PICKUP_ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED
    booking_status = Column(String, default="BOOKED")
    
    is_fallback_distance = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    deal = relationship("Deal", foreign_keys=[deal_id])
    provider = relationship("TransportProvider", foreign_keys=[transport_provider_id])
    farmer = relationship("User", foreign_keys=[farmer_id])
    buyer = relationship("User", foreign_keys=[buyer_id])

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    role = Column(String, nullable=False)  # FARMER, BUYER, TRANSPORTER
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CropProduction(Base):
    __tablename__ = "crop_productions"

    id = Column(String, primary_key=True, default=generate_uuid)
    farmer_id = Column(String, ForeignKey("users.id"), nullable=False)
    crop_name = Column(String, nullable=False)
    state = Column(String, nullable=False)
    district = Column(String, nullable=False)
    village = Column(String, nullable=True)
    cultivated_area = Column(Float, nullable=True)
    production_quantity = Column(Float, nullable=False)
    production_unit = Column(String, nullable=False)
    normalized_quantity_tonnes = Column(Float, nullable=False)
    season = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    status = Column(String, default="REGISTERED")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    farmer = relationship("User", foreign_keys=[farmer_id])

class ProductionThreshold(Base):
    __tablename__ = "production_thresholds"

    id = Column(String, primary_key=True, default=generate_uuid)
    crop_name = Column(String, nullable=False)
    state = Column(String, nullable=False)
    district = Column(String, nullable=False)
    season = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    threshold_quantity_tonnes = Column(Float, nullable=False)
    warning_percentage = Column(Float, nullable=False, default=10.0)
    critical_percentage = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class ProductionAlert(Base):
    __tablename__ = "production_alerts"

    id = Column(String, primary_key=True, default=generate_uuid)
    crop_name = Column(String, nullable=False)
    district = Column(String, nullable=False)
    season = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    severity = Column(String, nullable=False) # NORMAL, WARNING, CRITICAL
    deviation_percentage = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
