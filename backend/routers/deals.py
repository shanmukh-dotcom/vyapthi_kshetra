from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import datetime

from database import get_db
from models import CropListing, Deal, User, Notification
from schemas import DealCreateRequest, DealAcceptRequest

router = APIRouter(prefix="/api/deals", tags=["deals"])

@router.get("/listings")
def get_listings(db: Session = Depends(get_db)):
    """Fetch active crop listings."""
    listings = db.query(CropListing).filter(CropListing.status == "ACTIVE").all()
    result = []
    for l in listings:
        farmer = db.query(User).filter(User.id == l.farmer_id).first()
        result.append({
            "id": l.id,
            "farmer_id": l.farmer_id,
            "farmer_name": farmer.name if farmer else "Farmer",
            "crop_name": l.crop_name,
            "quantity_kg": l.quantity_kg,
            "price_per_kg": l.price_per_kg,
            "total_value": l.quantity_kg * l.price_per_kg,
            "location_name": l.location_name,
            "farmer_lat": l.farmer_lat,
            "farmer_lng": l.farmer_lng,
            "status": l.status,
            "created_at": l.created_at
        })
    return result

@router.post("/create-offer")
def create_offer(payload: DealCreateRequest, db: Session = Depends(get_db)):
    """Buyer makes an offer on a crop listing."""
    listing = db.query(CropListing).filter(CropListing.id == payload.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Crop listing not found")

    deal = Deal(
        listing_id=listing.id,
        farmer_id=listing.farmer_id,
        buyer_id=payload.buyer_id,
        crop_name=listing.crop_name,
        quantity_kg=listing.quantity_kg,
        deal_price=payload.deal_price,
        farmer_accepted=False,
        buyer_accepted=True,
        deal_status="OFFERED"
    )
    db.add(deal)
    db.commit()
    db.refresh(deal)
    return format_deal(deal, db)

@router.post("/{deal_id}/accept")
def accept_deal(deal_id: str, payload: DealAcceptRequest, db: Session = Depends(get_db)):
    """
    Farmer or Buyer accepts the deal.
    When BOTH accept:
    1. deal_status becomes "ACCEPTED"
    2. handle_deal_accepted is called automatically
    """
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    role = payload.user_role.upper()
    if role == "FARMER":
        deal.farmer_accepted = True
    elif role == "BUYER":
        deal.buyer_accepted = True
    else:
        raise HTTPException(status_code=400, detail="Invalid role. Use FARMER or BUYER.")

    # Check if both accepted
    if deal.farmer_accepted and deal.buyer_accepted:
        deal.deal_status = "ACCEPTED"
        deal.accepted_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(deal)
        
        # AUTOMATED TRANSPORT PROCESS TRIGGER
        transport_payload = handle_deal_accepted(deal, db)
        return {
            "deal": format_deal(deal, db),
            "transport_trigger": True,
            "transport_payload": transport_payload
        }

    db.commit()
    db.refresh(deal)
    return {
        "deal": format_deal(deal, db),
        "transport_trigger": False
    }

@router.get("/{deal_id}")
def get_deal(deal_id: str, db: Session = Depends(get_db)):
    """Fetch deal details."""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return format_deal(deal, db)

def handle_deal_accepted(deal: Deal, db: Session):
    """
    Trigger transport requirement automatically upon deal acceptance.
    Extracts farmer location, factory location, crop, and quantity.
    """
    farmer = db.query(User).filter(User.id == deal.farmer_id).first()
    buyer = db.query(User).filter(User.id == deal.buyer_id).first()

    n1 = Notification(
        user_id=deal.farmer_id,
        role="FARMER",
        title="Deal Accepted!",
        message=f"Deal for {deal.quantity_kg:,.0f} kg {deal.crop_name} accepted. Proceeding to select transport."
    )
    n2 = Notification(
        user_id=deal.buyer_id,
        role="BUYER",
        title="Deal Accepted!",
        message=f"Deal for {deal.quantity_kg:,.0f} kg {deal.crop_name} accepted. Transport option selection is ready."
    )
    db.add_all([n1, n2])
    db.commit()

    return {
        "deal_id": deal.id,
        "farmer_id": farmer.id if farmer else "",
        "farmer_name": farmer.name if farmer else "Farmer",
        "farmer_lat": farmer.latitude if farmer else 16.50,
        "farmer_lng": farmer.longitude if farmer else 80.64,
        "farmer_address": farmer.address if farmer else "Krishna District",
        "factory_id": buyer.id if buyer else "",
        "factory_name": buyer.name if buyer else "Factory / Buyer",
        "factory_lat": buyer.latitude if buyer else 16.52,
        "factory_lng": buyer.longitude if buyer else 80.62,
        "factory_address": buyer.address if buyer else "Vijayawada / Krishna District",
        "crop": deal.crop_name,
        "quantity_kg": deal.quantity_kg,
        "deal_price": deal.deal_price,
        "accepted_at": deal.accepted_at.isoformat() if deal.accepted_at else datetime.datetime.utcnow().isoformat()
    }

def format_deal(deal: Deal, db: Session):
    farmer = db.query(User).filter(User.id == deal.farmer_id).first()
    buyer = db.query(User).filter(User.id == deal.buyer_id).first()
    return {
        "id": deal.id,
        "listing_id": deal.listing_id,
        "farmer_id": deal.farmer_id,
        "farmer_name": farmer.name if farmer else "Farmer",
        "buyer_id": deal.buyer_id,
        "buyer_name": buyer.name if buyer else "Buyer",
        "crop_name": deal.crop_name,
        "quantity_kg": deal.quantity_kg,
        "deal_price": deal.deal_price,
        "farmer_accepted": deal.farmer_accepted,
        "buyer_accepted": deal.buyer_accepted,
        "deal_status": deal.deal_status,
        "accepted_at": deal.accepted_at,
        "created_at": deal.created_at
    }
