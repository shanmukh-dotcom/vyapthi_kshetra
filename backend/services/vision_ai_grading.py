"""
Vision-AI + RAG Potato Quality Grading Pipeline
Replaces the old Random Forest histogram model as the primary grading decision engine.

Pipeline Architecture:
1. Farmer uploads 1–3 potato images.
2. Image preprocessing: Downscales to 512px max dimension, quality-optimized JPEG base64 encoding.
3. Image Quality Validation: Rejects non-potato, blurry, or unreadable images.
4. Multimodal Vision Inspection:
   - Evaluates all uploaded images (Image 1, Image 2, Image 3).
   - Detects Healthy, Scab, Scurf, Blackspot Bruising, Blackleg, Brown Rot, Dry Rot, Pink Rot, Soft Rot.
5. Local RAG Retrieval:
   - Queries backend/modules/potato_ai/knowledge/ (defects, tolerances, rules, guidelines).
6. AI Grading Synthesis:
   - Evaluates overall batch defect severity, consistency across images, and rule thresholds.
   - Computes realistic Grade (A/B/C/D), Score (0-100), sub-scores, evidence, and recommendations.
7. Graceful Fallback:
   - Preserves existing deterministic engine as offline fallback if API is unreachable.
"""

import os
import io
import json
import base64
import logging
import requests
from typing import List, Dict, Any, Optional
from PIL import Image

from services.rag_retriever import retriever_service

logger = logging.getLogger(__name__)

def load_env():
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ[k.strip()] = v.strip().strip('"').strip("'")

load_env()

def get_gemini_api_key() -> Optional[str]:
    load_env()
    key = os.getenv("VISION_AI_API_KEY")
    if not key or key in ["your_gemini_api_key_here", "your_key_here", "your_vision_ai_api_key_here"]:
        return None
    return key

def prepare_image_inline_data(image_input: Any) -> Optional[Dict[str, str]]:
    """
    Optimizes and converts image input (file path, base64 data URL, bytes, PIL)
    into Gemini inline_data format with 512px max bounds for fast, reliable upload.
    """
    try:
        pil_img = None
        if isinstance(image_input, Image.Image):
            pil_img = image_input
        elif isinstance(image_input, bytes):
            pil_img = Image.open(io.BytesIO(image_input))
        elif isinstance(image_input, str):
            if image_input.startswith("data:image") and "," in image_input:
                b64_raw = image_input.split(",", 1)[1]
                pil_img = Image.open(io.BytesIO(base64.b64decode(b64_raw)))
            elif os.path.exists(image_input):
                pil_img = Image.open(image_input)
            else:
                # Relative to potato_dataset
                ds_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "potato_dataset", image_input)
                if os.path.exists(ds_path):
                    pil_img = Image.open(ds_path)

        if pil_img:
            if pil_img.mode != "RGB":
                pil_img = pil_img.convert("RGB")
            # Downscale large photos to 512px to prevent network timeouts
            pil_img.thumbnail((512, 512), Image.Resampling.LANCZOS)
            buffered = io.BytesIO()
            pil_img.save(buffered, format="JPEG", quality=80)
            b64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            return {"mime_type": "image/jpeg", "data": b64_str}

        return None
    except Exception as e:
        logger.error(f"Error preparing image inline data: {e}")
        return None


class VisionAIGradingPipeline:
    """
    Multimodal Vision AI + Local RAG Agricultural Grading Pipeline.
    """

    CANDIDATE_MODELS = [
        "gemini-3.1-flash-lite-preview",
        "gemini-3-flash-preview",
        "gemini-pro-latest"
    ]
    API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"

    def __init__(self):
        self.rules_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "modules", "potato_ai", "knowledge", "grading_rules.json"
        )
        self.defects_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "modules", "potato_ai", "knowledge", "potato_defects.json"
        )

    def _get_rag_context(self) -> str:
        """Loads curated agricultural knowledge guidelines to supply in prompt."""
        context_parts = []
        try:
            if os.path.exists(self.rules_path):
                with open(self.rules_path, "r", encoding="utf-8") as f:
                    context_parts.append(f"GRADING RULES & THRESHOLDS:\n{f.read()}")
            if os.path.exists(self.defects_path):
                with open(self.defects_path, "r", encoding="utf-8") as f:
                    context_parts.append(f"DEFECT CATALOG & SYMPTOMS:\n{f.read()}")
        except Exception as e:
            logger.warning(f"Could not load RAG context files: {e}")
        return "\n\n".join(context_parts)

    def analyze_batch(self, image_samples: List[Any], batch_notes: str = "", quantity_kg: float = 2000.0) -> Dict[str, Any]:
        """
        Executes complete Vision-AI + RAG grading pipeline across 1 to 3 images:
        1. Encodes and optimizes uploaded images.
        2. Inspects images with Vision Model.
        3. Retrieves local RAG agricultural knowledge chunks.
        4. Synthesizes final grade (A/B/C/D) and score (0-100).
        """
        api_key = get_gemini_api_key()
        if not api_key:
            logger.warning("No valid GEMINI_API_KEY found. Falling back to local grading engine.")
            return self._fallback_local_grading(image_samples, batch_notes)

        samples = (image_samples or [])[:3]
        inline_images = []
        for s in samples:
            data = prepare_image_inline_data(s)
            if data:
                inline_images.append(data)

        if not inline_images:
            return self._build_validation_failure("No valid image files could be processed from your upload.")

        # Construct Multimodal Prompt with RAG Knowledge
        rag_context = self._get_rag_context()
        num_images = len(inline_images)

        prompt = f"""
You are the Chief Agricultural Quality Auditor and Computer Vision Inspector for 'Vyapti Kshetra'.
You are inspecting {num_images} uploaded potato photo(s) for a {quantity_kg} kg consignment batch.
Farmer Batch Notes: "{batch_notes or 'Fresh harvest batch'}"

============================================================
LOCAL AGRICULTURAL RAG KNOWLEDGE BASE & GRADING STANDARDS:
============================================================
{rag_context}

============================================================
INSPECTION TASKS:
============================================================
1. IMAGE VALIDATION:
   - Inspect all {num_images} uploaded image(s).
   - Check if the image(s) clearly show potato tubers.
   - Check image quality: is it too blurry, too dark, or non-potato objects?
   - If the image contains an inanimate object or something else instead of a potato, DO NOT output random crop names. Instead, strictly set "is_valid_potato": false, "grade": "N/A", "score": 0, and set the "validation_message" to exactly: "Inanimate object or unrecognized item detected. Please upload a clear photo of potatoes."


2. MULTI-IMAGE DEFECT & QUALITY INSPECTION:
   - Inspect each image individually for visible symptoms:
     * Healthy Potatoes (clean, smooth golden/tan skin, firm, zero decay)
     * Common Scab (corky, pitted, rough brown lesions)
     * Black Scurf (hard black sclerotia spots adhering to skin)
     * Blackspot Bruising (dark/black internal or impact bruises)
     * Blackleg (inky black rotting starting from stem end)
     * Brown Rot (browning, vascular bacterial decay)
     * Dry Rot (sunken, shriveled, wrinkly dark fungal cavities)
     * Pink Rot (rubbery rotting flesh, pinkish hue upon exposure)
     * Soft Rot (water-soaked, mushy macerated pulp, liquefying decay)
     * Miscellaneous (greening, surface scratches, growth cracks)
   - Note visible evidence for each detected defect.

3. REALISTIC GRADING DECISION (CRITICAL RULE):
   - Combine the visual evidence across all {num_images} image(s) and strictly apply the Grading Thresholds:
     * Grade A (85-100 / 100): Premium/Export quality. Less than 3% superficial defects, ZERO rot or active decay.
     * Grade B (70-84 / 100): Standard Commercial. Minor scab or superficial scuffing acceptable, ZERO rot or soft decay.
     * Grade C (50-69 / 100): Table/Processing Grade. Noticeable defects, moderate scab/bruising, suitable only for immediate cooking or starch.
     * Grade D (<50 / 100): Sub-standard / High Defect. Extensive rot (soft rot, dry rot, brown rot), severe bruising, or deep decay. MUST BE REJECTED for standard commercial distribution.
   - DO NOT automatically assign Grade A. If you see rot, mold, or severe decay, assign Grade D or Grade C.
   - Sub-scores must total the final score:
     * Freshness (max 35)
     * Defect-Free (max 25)
     * Ripeness (max 20)
     * Uniformity (max 20)

4. RETURN PURE JSON matching this exact structure:
{{
  "is_valid_potato": true,
  "image_quality": "clear",
  "validation_message": "",
  "overall_assessment": "Grade B - Standard Commercial Potato with Minor Surface Scab",
  "grade": "B",
  "score": 76,
  "sub_scores": {{
    "freshness": 28.0,
    "defect_free": 17.0,
    "ripeness": 16.0,
    "uniformity": 15.0
  }},
  "defects": [
    {{
      "name": "Common Scab",
      "type_key": "common_scab",
      "severity": "moderate",
      "confidence": 0.85,
      "evidence": "Observed rough, corky circular pitted lesions on 15% of the tuber skin."
    }}
  ],
  "healthy_percentage_estimate": 75.0,
  "quality_reason": "Detailed 2-sentence explanation of WHY this grade was assigned citing the visible evidence and RAG standards.",
  "recommendations": [
    "Practical recommendation 1 based on agricultural guidelines",
    "Practical recommendation 2 based on post-harvest handling",
    "Practical recommendation 3 based on storage guidelines"
  ]
}}
"""
        # Assemble multimodal content parts
        parts = [{"text": prompt}]
        for idx, img_dict in enumerate(inline_images):
            parts.append({"text": f"--- Photo #{idx + 1} of {num_images} ---"})
            parts.append({"inline_data": img_dict})

        payload = {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.1
            }
        }

        for model in self.CANDIDATE_MODELS:
            url = self.API_URL_TEMPLATE.format(model=model, key=api_key)
            try:
                res = requests.post(url, json=payload, timeout=25.0)
                if res.status_code == 200:
                    resp_json = res.json()
                    text = resp_json["candidates"][0]["content"]["parts"][0]["text"]
                    data = json.loads(text)

                    # Check if image validation failed (e.g. non-potato or blurry)
                    if not data.get("is_valid_potato", True):
                        val_msg = data.get("validation_message") or "Unable to reliably grade this sample. Please upload a clear photo of potatoes."
                        return self._build_validation_failure(val_msg)

                    grade = data.get("grade", "B").upper()
                    if grade not in ["A", "B", "C", "D"]:
                        grade = "B"
                    score = round(float(data.get("score", 75)), 1)
                    sub_scores = data.get("sub_scores", {})
                    logger.info(f"Vision AI grading successfully completed with {model}")
                    break
                else:
                    logger.warning(f"Model {model} returned HTTP {res.status_code}: {res.text[:150]}")
            except Exception as e:
                logger.warning(f"Model {model} request failed: {e}")
        else:
            logger.warning("All candidate Vision AI models failed, using deterministic fallback")
            return self._fallback_local_grading(image_samples, batch_notes)

        # Format defects list
        raw_defects = data.get("defects", [])
        defects_formatted = []
        defect_keys = []
        for d in raw_defects:
            dname = d.get("name", "Blemish")
            dtype = d.get("type_key") or dname.lower().replace(" ", "_")
            sev = d.get("severity", "moderate").lower()
            conf = round(float(d.get("confidence", 0.8)), 2)
            evid = d.get("evidence", "Visual irregularity detected.")
            defects_formatted.append({
                "name": dname,
                "type": dtype,
                "severity": sev,
                "confidence": conf,
                "evidence": evid,
                "display_name": dname
            })
            defect_keys.append(dtype)

        # Format predictions list (for frontend multi-image prediction cards)
        predictions_formatted = []
        if defects_formatted:
            for d in defects_formatted:
                predictions_formatted.append({
                    "class": d["type"],
                    "confidence": d["confidence"],
                    "display_name": d["name"],
                    "is_healthy": False
                })
        else:
            predictions_formatted.append({
                "class": "healthy",
                "confidence": 0.95,
                "display_name": "Healthy Potatoes",
                "is_healthy": True
            })

        # RAG Sources
        rag_query = " ".join(defect_keys) + f" potato grade {grade}"
        rag_result = retriever_service.retrieve(query=rag_query, top_k=3)
        knowledge_sources = rag_result.get("source_ids", ["grading_rule_001"])

        return {
            "success": True,
            "crop": "Potato",
            "images_analyzed": len(inline_images),
            "predictions": predictions_formatted,
            "quality_score": score,
            "grade": grade,
            "defects": defects_formatted,
            "score_breakdown": {
                "freshness": round(float(sub_scores.get("freshness", 28.0)), 1),
                "defect_free": round(float(sub_scores.get("defect_free", 20.0)), 1),
                "ripeness": round(float(sub_scores.get("ripeness", 16.0)), 1),
                "uniformity": round(float(sub_scores.get("uniformity", 15.0)), 1)
            },
            "overall_assessment": data.get("overall_assessment", f"Grade {grade} Potato Quality Assessment"),
            "explanation": data.get("quality_reason", f"Assessed as Grade {grade} based on visual surface condition."),
            "quality_reason": data.get("quality_reason", ""),
            "recommendations": data.get("recommendations", [
                "Maintain cold storage at 7-10°C with 85-90% relative humidity.",
                "Segregate damaged tubers to prevent contagion."
            ]),
            "knowledge_sources": knowledge_sources,
            "healthy_percentage_estimate": float(data.get("healthy_percentage_estimate", 75.0)),
            "pipeline_type": "vision_ai_rag",
            "is_valid_potato": True,
            "validation_message": ""
        }

    def _build_validation_failure(self, message: str) -> Dict[str, Any]:
        """Returns structured response when image quality or potato validation fails."""
        return {
            "success": False,
            "crop": "Potato",
            "images_analyzed": 0,
            "predictions": [],
            "quality_score": 0.0,
            "grade": "N/A",
            "defects": [],
            "score_breakdown": {
                "freshness": 0.0,
                "defect_free": 0.0,
                "ripeness": 0.0,
                "uniformity": 0.0
            },
            "overall_assessment": "Image Quality Validation Failed",
            "explanation": message,
            "quality_reason": message,
            "recommendations": [
                "Ensure photos are taken in bright, natural daylight.",
                "Capture close-up photos focusing clearly on the potato tubers.",
                "Avoid blurry, heavily shaded, or non-potato objects."
            ],
            "knowledge_sources": [],
            "healthy_percentage_estimate": 0.0,
            "pipeline_type": "vision_ai_rag",
            "is_valid_potato": False,
            "validation_message": message
        }

    def _fallback_local_grading(self, samples: List[Any], batch_notes: str) -> Dict[str, Any]:
        """Preserves the existing deterministic grading engine as safe fallback."""
        from services.potato_grading import grading_engine
        result = grading_engine.analyze_multi_images(samples, batch_notes)
        return {
            "success": True,
            "crop": "Potato",
            "images_analyzed": result["images_analyzed"],
            "predictions": result.get("predictions", []),
            "quality_score": result["quality_score"],
            "grade": result["grade"],
            "defects": result["defects"],
            "score_breakdown": result["score_breakdown"],
            "overall_assessment": f"Grade {result['grade']} (Localized Fallback Analysis)",
            "explanation": "Evaluated using standard agricultural rule tolerances. (Vision AI temporarily unavailable).",
            "quality_reason": "Evaluated using localized deterministic rule engine.",
            "recommendations": [
                "Maintain cold storage between 7°C and 10°C with 85-90% relative humidity.",
                "Stack jute bags no higher than 8 layers in transit trucks."
            ],
            "knowledge_sources": ["grading_rule_001", "recommendation_storage_001"],
            "healthy_percentage_estimate": 70.0,
            "pipeline_type": "local_fallback",
            "is_valid_potato": True,
            "validation_message": ""
        }

# Global singleton instance
vision_ai_grading_pipeline = VisionAIGradingPipeline()
