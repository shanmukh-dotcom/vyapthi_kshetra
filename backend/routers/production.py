from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import datetime

from database import get_db
from models import CropProduction, ProductionThreshold, ProductionAlert, User
from schemas import (
    ProductionCreateRequest, ProductionResponse,
    ProductionSummaryResponse, ThresholdCreateRequest,
    ThresholdResponse, AlertResponse
)

router = APIRouter(prefix="/api/production", tags=["production"])

def normalize_to_tonnes(quantity: float, unit: str) -> float:
    unit = unit.lower().strip()
    if unit in ["tonne", "tonnes", "t", "mt"]:
        return quantity
    elif unit in ["kg", "kgs", "kilogram", "kilograms"]:
        return quantity / 1000.0
    elif unit in ["quintal", "quintals", "q"]:
        return quantity / 10.0
    # default fallback
    return quantity

@router.post("", response_model=ProductionResponse)
def create_or_update_production(payload: ProductionCreateRequest, db: Session = Depends(get_db)):
    """Create or update farmer production record. Uses farmer_id + crop + season + year to prevent duplicates."""
    farmer = db.query(User).filter(User.id == payload.farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    # Check for existing record
    existing = db.query(CropProduction).filter(
        CropProduction.farmer_id == payload.farmer_id,
        CropProduction.crop_name == payload.crop_name,
        CropProduction.season == payload.season,
        CropProduction.year == payload.year
    ).first()

    norm_tonnes = normalize_to_tonnes(payload.production_quantity, payload.production_unit)
    
    # Use profile location if not explicitly provided
    state = payload.state or (farmer.address.split(",")[-1].strip() if farmer.address else "Andhra Pradesh")
    district = payload.district or "Krishna District"

    if existing:
        existing.production_quantity = payload.production_quantity
        existing.production_unit = payload.production_unit
        existing.normalized_quantity_tonnes = norm_tonnes
        existing.cultivated_area = payload.cultivated_area
        existing.state = state
        existing.district = district
        existing.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_prod = CropProduction(
            farmer_id=payload.farmer_id,
            crop_name=payload.crop_name,
            state=state,
            district=district,
            village=payload.village,
            cultivated_area=payload.cultivated_area,
            production_quantity=payload.production_quantity,
            production_unit=payload.production_unit,
            normalized_quantity_tonnes=norm_tonnes,
            season=payload.season,
            year=payload.year
        )
        db.add(new_prod)
        db.commit()
        db.refresh(new_prod)
        return new_prod

@router.get("/my", response_model=List[ProductionResponse])
def get_my_production(farmer_id: str, db: Session = Depends(get_db)):
    """Get logged-in farmer's production records."""
    return db.query(CropProduction).filter(CropProduction.farmer_id == farmer_id).all()

@router.get("/summary", response_model=ProductionSummaryResponse)
def get_production_summary(crop_name: str, district: str, season: str, year: int, db: Session = Depends(get_db)):
    """Get aggregated production for a given crop+district+season+year."""
    records = db.query(CropProduction).filter(
        CropProduction.crop_name == crop_name,
        CropProduction.district == district,
        CropProduction.season == season,
        CropProduction.year == year
    ).all()
    
    total_farmers = len(records)
    total_tonnes = sum(r.normalized_quantity_tonnes for r in records)
    
    return ProductionSummaryResponse(
        crop_name=crop_name,
        state=records[0].state if records else "Andhra Pradesh",
        district=district,
        season=season,
        year=year,
        total_registered_farmers=total_farmers,
        total_expected_production_tonnes=total_tonnes
    )

@router.post("/thresholds", response_model=ThresholdResponse)
def create_threshold(payload: ThresholdCreateRequest, db: Session = Depends(get_db)):
    """Setup thresholds (Admin)."""
    # Overwrite if exists
    existing = db.query(ProductionThreshold).filter(
        ProductionThreshold.crop_name == payload.crop_name,
        ProductionThreshold.district == payload.district,
        ProductionThreshold.season == payload.season,
        ProductionThreshold.year == payload.year
    ).first()
    
    if existing:
        existing.threshold_quantity_tonnes = payload.threshold_quantity_tonnes
        existing.warning_percentage = payload.warning_percentage
        existing.critical_percentage = payload.critical_percentage
        db.commit()
        db.refresh(existing)
        return existing
    
    new_thresh = ProductionThreshold(
        crop_name=payload.crop_name,
        state=payload.state,
        district=payload.district,
        season=payload.season,
        year=payload.year,
        threshold_quantity_tonnes=payload.threshold_quantity_tonnes,
        warning_percentage=payload.warning_percentage,
        critical_percentage=payload.critical_percentage
    )
    db.add(new_thresh)
    db.commit()
    db.refresh(new_thresh)
    return new_thresh

@router.get("/alerts", response_model=AlertResponse)
def get_production_alerts(crop_name: str, district: str, season: str, year: int, db: Session = Depends(get_db)):
    """Checks current aggregation against threshold and returns Alert."""
    threshold = db.query(ProductionThreshold).filter(
        ProductionThreshold.crop_name == crop_name,
        ProductionThreshold.district == district,
        ProductionThreshold.season == season,
        ProductionThreshold.year == year
    ).first()
    
    if not threshold:
        raise HTTPException(status_code=404, detail="Threshold not configured for this region/crop/season.")
        
    records = db.query(CropProduction).filter(
        CropProduction.crop_name == crop_name,
        CropProduction.district == district,
        CropProduction.season == season,
        CropProduction.year == year
    ).all()
    
    total_farmers = len(records)
    total_tonnes = sum(r.normalized_quantity_tonnes for r in records)
    
    diff_tonnes = total_tonnes - threshold.threshold_quantity_tonnes
    deviation_pct = (diff_tonnes / threshold.threshold_quantity_tonnes) * 100.0 if threshold.threshold_quantity_tonnes > 0 else 0
    
    severity = "NORMAL"
    message = "Production is comfortably above the threshold."
    
    if total_tonnes < threshold.threshold_quantity_tonnes:
        severity = "CRITICAL"
        message = f"Expected potato production from registered farmers in {district} is {abs(deviation_pct):.1f}% below the configured threshold."
    elif deviation_pct <= threshold.warning_percentage:
        severity = "WARNING"
        message = f"Production is approaching the threshold limit. Currently at {deviation_pct:.1f}% above threshold."
        
    # Log alert history (to avoid duplicating if identical state)
    last_alert = db.query(ProductionAlert).filter(
        ProductionAlert.crop_name == crop_name,
        ProductionAlert.district == district,
        ProductionAlert.season == season,
        ProductionAlert.year == year
    ).order_by(ProductionAlert.created_at.desc()).first()
    
    if not last_alert or last_alert.severity != severity or abs(last_alert.deviation_percentage - deviation_pct) > 1.0:
        new_alert = ProductionAlert(
            crop_name=crop_name,
            district=district,
            season=season,
            year=year,
            severity=severity,
            deviation_percentage=deviation_pct
        )
        db.add(new_alert)
        db.commit()

    return AlertResponse(
        crop_name=crop_name,
        district=district,
        year=year,
        season=season,
        registered_farmers=total_farmers,
        expected_production_tonnes=total_tonnes,
        threshold_tonnes=threshold.threshold_quantity_tonnes,
        difference_tonnes=diff_tonnes,
        deviation_percentage=deviation_pct,
        severity=severity,
        message=message
    )
