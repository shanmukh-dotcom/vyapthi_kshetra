import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base, SessionLocal
from models import TransportProvider
from routers import auth, deals, logistics, potato_ai
from seed import seed_db

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vyapti Kshetra - Agri-Commerce Logistics & AI Engine",
    description="Automated Transport, Routing, Matching & Potato AI APIs for Farm-to-Factory Deals",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auto seed on first startup if no transporters exist
@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        count = db.query(TransportProvider).count()
        if count == 0:
            print("Auto-seeding initial transport providers and demo deal...")
            seed_db()
    finally:
        db.close()

app.include_router(auth.router)
app.include_router(deals.router)
app.include_router(logistics.router)
app.include_router(potato_ai.router)

from fastapi.staticfiles import StaticFiles
team_repo_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "team_repo")
if os.path.exists(team_repo_dir):
    app.mount("/team", StaticFiles(directory=team_repo_dir, html=True), name="team_repo")

@app.get("/")
def root():
    return {
        "app": "Vyapti Kshetra API Engine",
        "status": "online",
        "docs_url": "http://localhost:8000/docs",
        "openapi_url": "http://localhost:8000/openapi.json",
        "modules": ["auth", "deals", "logistics", "potato_ai"],
        "osrm_routing": "enabled"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
