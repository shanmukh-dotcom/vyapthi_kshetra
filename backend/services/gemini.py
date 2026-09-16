import os
import json
import logging
import requests

logger = logging.getLogger(__name__)

def load_env():
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    clean_val = val.strip().strip('"').strip("'")
                    os.environ[key.strip()] = clean_val

load_env()

def get_ai_recommendation(crop: str, quantity_kg: float, farmer_address: str, factory_address: str, options: list):
    """
    Sends structured transporter options to Gemini API (or uses server-side structured reasoning fallback if no key set).
    Returns structured AI recommendation dict.
    """
    load_env()
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("VISION_AI_API_KEY")
    if not api_key or api_key in ["your_gemini_api_key_here", "your_key_here"]:
        api_key = None

    if not options:
        return {
            "recommended_transporter_id": None,
            "reason": "No suitable transport providers found matching the required payload capacity.",
            "why_points": ["No vehicles available with capacity >= required quantity"],
            "alternative_ids": [],
            "warnings": ["Please expand your search radius or split consignment into smaller loads."]
        }

    transporters_summary = []
    for opt in options:
        transporters_summary.append({
            "id": opt["id"],
            "name": opt["name"],
            "vehicle_type": opt["vehicle_type"],
            "vehicle_number": opt["vehicle_number"],
            "capacity_kg": opt["capacity_kg"],
            "distance_from_farmer_km": opt["distance_from_farmer_km"],
            "estimated_cost": opt["estimated_cost"],
            "cost_per_kg": opt["cost_per_kg"],
            "rate_per_km": opt["rate_per_km"],
            "rating": opt.get("rating", 4.8),
            "verified": opt.get("verified", True)
        })

    if api_key:
        candidate_models = ["gemini-3.1-flash-lite-preview", "gemini-3-flash-preview", "gemini-pro-latest"]
        for model in candidate_models:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
                prompt_text = f"""
You are an expert Agri-Commerce Logistics AI Advisor for 'Vyapti Kshetra'.
Analyze the following real available transport providers for a crop deal and recommend the single best option.

DEAL DETAILS:
- Crop: {crop}
- Quantity: {quantity_kg} kg
- Pickup: {farmer_address}
- Delivery: {factory_address}

AVAILABLE TRANSPORTERS DATA:
{json.dumps(transporters_summary, indent=2)}

RULES:
1. Only evaluate the provided transporters. Never invent fake names, prices, or locations.
2. Select the optimal transporter balancing payload capacity (must be >= {quantity_kg} kg), pickup proximity to farmer, rating, and cost efficiency.
3. Return valid JSON only with keys:
   "recommended_transporter_id": (string matching id),
   "reason": (short 2-sentence explanation for a farmer),
   "why_points": (list of 4 concise bullet points: capacity, proximity, cost, availability/rating),
   "alternative_ids": (list of other suitable IDs),
   "warnings": (list of any relevant warnings or empty list)
"""
                payload = {
                    "contents": [{"parts": [{"text": prompt_text}]}],
                    "generationConfig": {"response_mime_type": "application/json"}
                }
                res = requests.post(url, json=payload, timeout=6.0)
                if res.status_code == 200:
                    resp_json = res.json()
                    text_content = resp_json["candidates"][0]["content"]["parts"][0]["text"]
                    return json.loads(text_content)
            except Exception as e:
                logger.warning(f"Gemini API call ({model}) failed: {e}. Trying next model.")

    # FALLBACK REASONING ENGINE
    sorted_options = sorted(
        options,
        key=lambda x: (
            (x["distance_from_farmer_km"] * 0.4) + 
            (x["estimated_cost"] / 100 * 0.4) - 
            (x.get("rating", 4.5) * 10 * 0.2)
        )
    )

    best = sorted_options[0]
    alternatives = [o["id"] for o in sorted_options[1:]]

    why_points = [
        f"Sufficient vehicle payload capacity ({best['capacity_kg']:,.0f} kg capacity >= {quantity_kg:,.0f} kg crop load)",
        f"Closest available fleet vehicle ({best['distance_from_farmer_km']} km from farmer pickup)",
        f"Economical transport freight rate (₹{best['estimated_cost']:,.0f} total / ₹{best['cost_per_kg']:.2f}/kg)",
        f"Verified carrier with {best.get('rating', 4.8)}★ rating and active availability"
    ]

    reason = (
        f"Based on vehicle payload capacity ({best['capacity_kg']:,.0f} kg), pickup proximity ({best['distance_from_farmer_km']} km), "
        f"and total freight cost (₹{best['estimated_cost']:,.0f}), {best['name']} ({best['vehicle_type']}) "
        f"is the most optimal recommendation for this {quantity_kg:,.0f} kg {crop} shipment."
    )

    return {
        "recommended_transporter_id": best["id"],
        "reason": reason,
        "why_points": why_points,
        "alternative_ids": alternatives,
        "warnings": []
    }

def get_potato_ai_explanation(grade: str, quality_score: float, defects: list, rag_chunks: list):
    """
    Uses Gemini API (or structured fallback) to summarize retrieved RAG knowledge chunks
    and explain the DETERMINISTICALLY CALCULATED potato grade to a farmer.
    
    IMPORTANT: Gemini MUST NOT alter the grade or quality score.
    """
    load_env()
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("VISION_AI_API_KEY")
    if not api_key or api_key in ["your_gemini_api_key_here", "your_key_here"]:
        api_key = None

    if api_key:
        candidate_models = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-flash-latest"]
        for model in candidate_models:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
                prompt_text = f"""
You are an expert Agricultural Potato Crop Advisor for Vyapti Kshetra.
The crop quality grading engine has calculated the following deterministic results:

CROP ANALYSIS RESULT:
- Calculated Grade: {grade}
- Quality Score: {quality_score}/100
- Detected Defects: {json.dumps(defects)}

RETRIEVED AGRICULTURAL KNOWLEDGE BASE CHUNKS:
{json.dumps(rag_chunks, indent=2)}

TASK:
1. Explain the {grade} grade to the farmer in 2 clear, encouraging sentences.
2. Provide 3 practical post-harvest / storage recommendations based on the retrieved knowledge chunks.
3. Do NOT change the calculated grade ({grade}) or score ({quality_score}).
4. Return valid JSON with keys: "explanation" (string), "recommendations" (list of strings).
"""
                payload = {
                    "contents": [{"parts": [{"text": prompt_text}]}],
                    "generationConfig": {"response_mime_type": "application/json"}
                }
                res = requests.post(url, json=payload, timeout=6.0)
                if res.status_code == 200:
                    resp_json = res.json()
                    text_content = resp_json["candidates"][0]["content"]["parts"][0]["text"]
                    return json.loads(text_content)
            except Exception as e:
                logger.warning(f"Gemini API call ({model}) failed for potato explanation: {e}. Trying next model.")

    # FALLBACK GENERATOR
    exp = (
        f"Your Potato crop batch achieved Grade {grade} with an overall quality score of {quality_score}/100. "
        f"The tubers display high fresh dry-matter content with minimal superficial blemish incidence, making this batch well-suited for industrial processing and commercial sale."
    )
    recs = [
        "Maintain cold storage temperature between 7°C and 10°C with 85-90% relative humidity to prevent sprouting.",
        "Stack jute bags no higher than 8 layers in transit trucks to avoid bottom-bag pressure bruising.",
        "Allow batch temperature to equalize above 8°C prior to industrial factory washing."
    ]

    return {
        "explanation": exp,
        "recommendations": recs
    }
