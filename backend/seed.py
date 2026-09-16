from database import engine, Base, SessionLocal
from models import User, CropListing, Deal, TransportProvider, TransportBooking, Notification
import datetime

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data for clean demo seed
    db.query(Notification).delete()
    db.query(TransportBooking).delete()
    db.query(TransportProvider).delete()
    db.query(Deal).delete()
    db.query(CropListing).delete()
    db.query(User).delete()
    db.commit()

    print("Seeding database...")

    # 1. Users
    farmer = User(
        id="usr_farmer_101",
        name="Rambabu (Farmer)",
        role="FARMER",
        phone="+91 98480 12345",
        email="rambabu@vyapti.in",
        address="Gudivada Road, Krishna District, AP",
        latitude=16.5060,
        longitude=80.6480
    )

    buyer = User(
        id="usr_buyer_201",
        name="Vijayawada Agro Processing Factory",
        role="BUYER",
        phone="+91 866 257 8900",
        email="procurement@vjwagro.com",
        address="Auto Nagar Industrial Park, Vijayawada, AP",
        latitude=16.5180,
        longitude=80.6190
    )

    db.add_all([farmer, buyer])
    db.commit()

    # 2. Demo Transport Providers Distributed Across Farmer & Factory Hubs
    t1 = TransportProvider(
        id="tp_001",
        name="Sri Panduranga Lorry Transport",
        phone="+91 94401 56789",
        email="panduranga.transport@gmail.com",
        vehicle_type="14-ft Eicher",
        vehicle_number="AP 16 TH 4582",
        capacity_kg=3500.0,
        latitude=16.5040,
        longitude=80.6350,
        service_area="Krishna District & Vijayawada",
        rate_per_km=55.0,
        base_cost=0.0,
        availability_status="AVAILABLE",
        verified=True,
        rating=4.9
    )



    t3 = TransportProvider(
        id="tp_003",
        name="Kranti Road Transport",
        phone="+91 98492 33445",
        email="info@krantitransport.in",
        vehicle_type="Bada Dost",
        vehicle_number="AP 16 TV 1204",
        capacity_kg=1500.0,
        latitude=16.4980,
        longitude=80.6420,
        service_area="Gudivada & Rural Krishna",
        rate_per_km=29.0,
        base_cost=0.0,
        availability_status="AVAILABLE",
        verified=True,
        rating=4.6
    )

    t4 = TransportProvider(
        id="tp_004",
        name="Mathrusri Logistics",
        phone="+91 93939 11223",
        email="mathrusri.logistics@yahoo.com",
        vehicle_type="14-ft Eicher",
        vehicle_number="AP 16 TX 7750",
        capacity_kg=3500.0,
        latitude=16.5020,
        longitude=80.6400,
        service_area="Krishna District Region",
        rate_per_km=52.0,
        base_cost=0.0,
        availability_status="AVAILABLE",
        verified=True,
        rating=4.7
    )

    db.add_all([t1, t3, t4])
    db.commit()

    # 3. Crop Listing
    listing = CropListing(
        id="lst_potato_001",
        farmer_id=farmer.id,
        crop_name="Potato",
        quantity_kg=2000.0,
        price_per_kg=25.0,
        location_name="Gudivada Road, Krishna District",
        farmer_lat=farmer.latitude,
        farmer_lng=farmer.longitude,
        status="ACTIVE"
    )

    db.add(listing)
    db.commit()

    # 4. Accepted Deal
    deal = Deal(
        id="deal_potato_88",
        listing_id=listing.id,
        farmer_id=farmer.id,
        buyer_id=buyer.id,
        crop_name="Potato",
        quantity_kg=2000.0,
        deal_price=50000.0,
        farmer_accepted=True,
        buyer_accepted=True,
        deal_status="ACCEPTED",
        accepted_at=datetime.datetime.utcnow()
    )

    db.add(deal)
    db.commit()

    # 5. Production Threshold & Dummy Production Data
    from models import ProductionThreshold, CropProduction

    # Clear old production data if any
    db.query(ProductionThreshold).delete()
    db.query(CropProduction).delete()
    db.commit()

    threshold = ProductionThreshold(
        crop_name="Potato",
        state="Andhra Pradesh",
        district="Krishna District",
        season="Rabi",
        year=2026,
        threshold_quantity_tonnes=100.0,
        warning_percentage=10.0,
        critical_percentage=0.0
    )
    db.add(threshold)

    # Seed 3 dummy farmers to create a baseline. 
    # Total so far: 18 + 20 + 15 = 53 tonnes
    dummy_prods = [
        CropProduction(
            farmer_id="usr_dummy_1", crop_name="Potato", state="Andhra Pradesh",
            district="Krishna District", village="Nuzvid", cultivated_area=10.0,
            production_quantity=18.0, production_unit="tonnes", normalized_quantity_tonnes=18.0,
            season="Rabi", year=2026, status="REGISTERED"
        ),
        CropProduction(
            farmer_id="usr_dummy_2", crop_name="Potato", state="Andhra Pradesh",
            district="Krishna District", village="Gudivada", cultivated_area=12.0,
            production_quantity=20.0, production_unit="tonnes", normalized_quantity_tonnes=20.0,
            season="Rabi", year=2026, status="REGISTERED"
        ),
        CropProduction(
            farmer_id="usr_dummy_3", crop_name="Potato", state="Andhra Pradesh",
            district="Krishna District", village="Machilipatnam", cultivated_area=8.0,
            production_quantity=15.0, production_unit="tonnes", normalized_quantity_tonnes=15.0,
            season="Rabi", year=2026, status="REGISTERED"
        )
    ]
    db.add_all(dummy_prods)
    db.commit()

    db.close()

    print("Seed complete! Demo users, Potato deal (2000 kg), 3 Transporters, and Production thresholds initialized.")

if __name__ == "__main__":
    seed_db()
