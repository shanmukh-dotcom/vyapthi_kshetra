# 🌿 VYAPTI KSHETRA (వ్యప్తి క్షేత్ర)
> **Bridging Fields to Fair Markets**  
> *SIH26033 — Multimodal AI-Powered Direct Farmer-to-Market & Quality Intelligence Ecosystem*

---

## 🔗 Live Deployments & Interactive Links

| Component | Host Platform | Live URL / Endpoint |
| :--- | :--- | :--- |
| 🌐 **Live Web Application** | Render (Static Site) | [https://vyapthi-kshetra.onrender.com](https://vyapthi-kshetra.onrender.com) |
| ⚡ **Live Backend API** | Render (Web Service) | [https://vyapthi-kshetra-backend.onrender.com](https://vyapthi-kshetra-backend.onrender.com) |
| 📚 **Interactive Swagger Docs** | Render (FastAPI OpenAPI) | [https://vyapthi-kshetra-backend.onrender.com/docs](https://vyapthi-kshetra-backend.onrender.com/docs) |
| 💻 **GitHub Repository** | GitHub | [https://github.com/shanmukh-dotcom/vyapthi_kshetra](https://github.com/shanmukh-dotcom/vyapthi_kshetra) |

---

## 📌 Executive Summary

**Vyapti Kshetra** is an end-to-end agricultural platform designed to eliminate middlemen, protect farmers from distress selling, and automate quality grading using **Multimodal Vision-AI**, **Local RAG (Retrieval-Augmented Generation)**, **Fair Price Intelligence**, and **Shared Collective Logistics**.

The platform is designed with rural accessibility at its core, featuring **7-language voice assistance**, **step-by-step element highlighting tours**, and **instant, friction-free role selection**.

---

## 🌟 Core Features & Modules

```
                        ┌────────────────────────────────────────┐
                        │           VYAPTI KSHETRA               │
                        └───────────────────┬────────────────────┘
                                            │
           ┌────────────────────────────────┼────────────────────────────────┐
           ▼                                ▼                                ▼
┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
│  🌾 Farmer Dashboard │        │  🛒 Consumer/Buyer   │        │  🤖 Vision AI + RAG  │
│  - Grade & Sell      │        │  - Match & Source    │        │  - Quality Grading   │
│  - Shared Logistics  │        │  - Direct Purchasing │        │  - 300+ Q&A Chatbot  │
│  - Price Guard       │        │  - Order Tracking    │        │  - Voice Tour        │
└──────────────────────┘        └──────────────────────┘        └──────────────────────┘
```

### 1. 🌾 Instant Role Selection (Frictionless Access)
* **Direct Role Routing:** Users select between **Farmer** or **Buyer** and are routed directly to their personalized dashboard (`/farmer-home.html` or `/consumer-home.html`) without login barriers.
* **Multilingual Voice Prompts:** Integrated voice guidance in 7 languages (Telugu, Hindi, Kannada, Tamil, Marathi, Bengali, English).

### 2. 🔬 Vision-AI + RAG Crop Quality Grading
* **Multimodal Visual Inspection:** Leverages **Google Gemini Multimodal Vision API** combined with **HSV Pixel Color Analysis** (dark rot ratio & texture variance heuristics).
* **AGMARK & CPRI Standards:** Evaluates produce into 4 commercial grades:
  * 🟢 **Grade A (85–100):** Premium/Export Quality (Zero rot, <3% blemishes).
  * 🔵 **Grade B (70–84):** Standard Commercial Grade (Minor scab/scuffing allowed).
  * 🟡 **Grade C (50–69):** Processing/Starch Grade (Moderate defects/bruising).
  * 🔴 **Grade D (<50):** Sub-standard / Rejected (Soft rot, blackleg, severe decay).
* **Detailed Score Breakdown:** Quantifies **Freshness (35 pts)**, **Defect-Free (25 pts)**, **Ripeness (20 pts)**, and **Uniformity (20 pts)**.

### 3. 🌿 "Ask Vyapti" Agricultural AI Assistant
* **300+ Verified Q&A Knowledge Base:** Embedded chatbot trained on agricultural guidelines.
* **Key Topics Covered:** Crop health, pest remedies, mandi prices, government schemes (**PM-KISAN ₹6,000**, **PMFBY Crop Insurance**, **KCC 4% Loans**, **SMAM Tractor Subsidies**), and shared transport.

### 4. 🔊 Voice Guidance & Element Highlighting
* **Voice-Enabled Step-by-Step Tour:** Uses Web Speech Synthesis and Capacitor Native TTS to narrate page features step-by-step.
* **Interactive UI Glow:** Highlights the relevant card or element on screen as the voice narration plays.

### 5. 🚚 Shared Collective Logistics & Price Guard
* **Spatial Matching:** Uses OSRM (Open Source Routing Machine) distance calculations to group nearby crop listings and match them with transport providers (Tata Ace, Mahindra Bolero, Eicher Pro).
* **Fair Price Guard:** Recommends fair price ranges based on market sentiment, historical data, and crop grade.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | HTML5, CSS3, JavaScript (ES6+), Tailwind CSS, Vite |
| **Mobile App (APK)** | Capacitor 6, Android Studio |
| **Backend API** | Python 3.11, FastAPI, Uvicorn, SQLAlchemy |
| **Database** | SQLite (Dev) / PostgreSQL (Production) |
| **AI / ML & Computer Vision** | Google Gemini 2.5 Flash, Scikit-Learn (RandomForest), Pillow, NumPy |
| **Geospatial & Routing** | OSRM (Open Source Routing Machine), Haversine Spatial Distance |
| **Hosting & Cloud Deployment** | Render (Static Site for Frontend, Web Service for Backend) |

---

## 📁 Repository Structure

```
VYAPTHI KSHETRA/
├── backend/                        # FastAPI Backend Application
│   ├── main.py                     # Entry point & CORS configuration
│   ├── database.py                 # SQLAlchemy database session
│   ├── models.py                   # Data models (User, CropListing, Deal, etc.)
│   ├── schemas.py                  # Pydantic request/response schemas
│   ├── requirements.txt            # Python dependencies
│   ├── models/potato/              # Pre-trained Random Forest ML model (.joblib)
│   ├── modules/potato_ai/          # Local RAG knowledge base JSON files
│   ├── routers/                    # API route handlers (auth, deals, logistics, potato_ai)
│   └── services/                   # Vision AI, RAG retriever, OSRM routing services
│
├── src/                            # Frontend Modular JavaScript & Styling
│   ├── ask-vyapti.js               # "Ask Vyapti" AI Chatbot logic
│   ├── ask-vyapti.css              # Chatbot drawer styles
│   ├── vyapti-kb.js                # 300+ Verified Agricultural Q&A database
│   ├── guided-tour.js              # Voice tour & element highlighter
│   ├── farmer-app.js               # Farmer state & dashboard integration
│   └── role.js                     # Role selection & instant routing
│
├── assets/                         # Graphic assets, crop icons, and illustrations
├── dist/                           # Production web build directory
├── android/                        # Capacitor Android native project files
├── index.html                      # Language Selection Page
├── role.html                       # Role Selection Page
├── farmer-home.html                # Farmer Dashboard
├── farmer-grade-sell.html          # AI Quality Grading & Selling Interface
├── farmer-market.html              # Price Intelligence & Mandi Trends
├── farmer-collective-logistics.html # Shared Transport Matching
├── consumer-home.html              # Buyer / Consumer Marketplace
├── vite.config.js                  # Vite build & asset bundling configuration
└── README.md                       # Project documentation
```

---

## ⚙️ Local Development & Setup Guide

### 1. Prerequisites
* **Node.js** (v18.0 or higher)
* **Python** (v3.11 or higher)
* **Git**

---

### 2. Backend Setup (FastAPI)

```bash
# Navigate to project root
cd "VYAPTHI KSHETRA"

# Install backend dependencies
pip install -r backend/requirements.txt

# Start the FastAPI Uvicorn server
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

> The API server will start at `http://localhost:8000`. Access Swagger docs at `http://localhost:8000/docs`.

---

### 3. Frontend Setup (Vite Web App)

```bash
# In a new terminal window at project root
cd "VYAPTHI KSHETRA"

# Install Node dependencies
npm install

# Start Vite local development server
npm run dev
```

> The local web app will open at `http://localhost:3000`.

---

### 4. Building Mobile Android APK (Capacitor)

```bash
# Build the production web assets
npm run build

# Sync web assets to Android platform
npx cap sync android

# Open project in Android Studio to build APK
npx cap open android
```

---

## 🌟 Hackathon & Prototype Highlights (SIH26033)

* **Zero Login Friction:** Enables instant evaluation for hackathon judges and farmers without phone verification roadblocks.
* **Deterministic + Generative AI Dual Engine:** Combines fast local Random Forest & pixel heuristics with Gemini Multimodal LLM fallback.
* **Offline-First Resilience:** Works offline with local rule engines when network access is limited.

---

## 📜 License & Credits

Developed by **Team Shanmukh** for **Smart India Hackathon (SIH26033)**.  
*All agricultural standards aligned with AGMARK & Central Potato Research Institute (CPRI) guidelines.*
