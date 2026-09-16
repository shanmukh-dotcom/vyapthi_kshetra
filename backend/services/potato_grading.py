import json
import os
import logging
from typing import List, Dict, Any

from services.potato_vision import potato_vision_model

logger = logging.getLogger(__name__)

class PotatoGradingEngine:
    """
    Deterministic Potato Grading Engine connected to the trained Potato Vision Model.
    Processes 1 to 3 images through PotatoVisionModel, receives defect predictions + confidence,
    aggregates quality features, and applies deterministic grading thresholds from grading_rules.json.
    
    IMPORTANT: The final grade and quality score are calculated STRICTLY by Python application logic.
    Gemini MUST NOT alter or override the calculated grade.
    """

    def __init__(self):
        self.rules_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "modules", "potato_ai", "knowledge", "grading_rules.json"
        )
        self.rules = self._load_rules()

    def _load_rules(self):
        if os.path.exists(self.rules_path):
            try:
                with open(self.rules_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to load grading_rules.json: {e}")

        # Default rule configuration
        return {
            "grade_thresholds": {
                "A": { "min_score": 85.0, "max_score": 100.0 },
                "B": { "min_score": 70.0, "max_score": 84.99 },
                "C": { "min_score": 50.0, "max_score": 69.99 },
                "D": { "min_score": 0.0, "max_score": 49.99 }
            },
            "score_weights": {
                "freshness_max": 35.0,
                "defect_free_max": 25.0,
                "ripeness_max": 20.0,
                "uniformity_max": 20.0
            }
        }

    def analyze_multi_images(self, image_samples: List[Any], batch_notes: str = "") -> Dict[str, Any]:
        """
        1. Runs each of the 1-3 images independently through the trained Potato Vision Model.
        2. Aggregates vision defect detections and confidence scores.
        3. Computes deterministic quality_score and Grade (A/B/C/D).
        """
        # Step 1: Real Vision Model Inference across 1 to 3 images
        vision_batch = potato_vision_model.analyze_batch(image_samples)
        predictions = vision_batch["predictions"]
        detected_defects = vision_batch["defects"]
        valid_count = vision_batch["images_analyzed"]

        # Step 2: Deterministic Score Calculation based on vision detections
        # Maximum potential sub-scores
        freshness_score = 35.0    # out of 35
        defect_free_score = 25.0  # out of 25
        ripeness_score = 20.0     # out of 20
        uniformity_score = 20.0   # out of 20

        # Assess vision defects
        if not detected_defects:
            # Batch is evaluated as Healthy Potatoes
            freshness_score = 34.0
            defect_free_score = 24.5
            ripeness_score = 19.5
            uniformity_score = 18.0
        else:
            for defect in detected_defects:
                dtype = defect["type"]
                conf = defect.get("confidence", 0.7)
                severity = defect.get("severity", "moderate")

                if severity == "critical":  # e.g., Soft Rot
                    defect_free_score -= 20.0 * conf
                    freshness_score -= 15.0 * conf
                    uniformity_score -= 10.0 * conf
                elif severity == "severe":  # e.g., Dry Rot, Brown Rot, Pink Rot, Blackleg
                    defect_free_score -= 16.0 * conf
                    freshness_score -= 10.0 * conf
                    uniformity_score -= 8.0 * conf
                elif severity == "moderate":  # e.g., Common Scab, Blackspot Bruising, Black Scurf
                    defect_free_score -= 10.0 * conf
                    uniformity_score -= 6.0 * conf
                else:  # minor blemish / miscellaneous
                    defect_free_score -= 5.0 * conf
                    uniformity_score -= 3.0 * conf

        # Normalize boundaries
        freshness_score = max(min(freshness_score, 35.0), 0.0)
        defect_free_score = max(min(defect_free_score, 25.0), 0.0)
        ripeness_score = max(min(ripeness_score, 20.0), 0.0)
        uniformity_score = max(min(uniformity_score, 20.0), 0.0)

        # Total score: 0 to 100
        total_score = round(freshness_score + defect_free_score + ripeness_score + uniformity_score, 1)
        total_score = max(min(total_score, 100.0), 0.0)

        # Step 3: Deterministic Grade Determination (A/B/C/D) via grading_rules.json
        thresholds = self.rules.get("grade_thresholds", {})
        if total_score >= thresholds.get("A", {}).get("min_score", 85.0):
            grade = "A"
        elif total_score >= thresholds.get("B", {}).get("min_score", 70.0):
            grade = "B"
        elif total_score >= thresholds.get("C", {}).get("min_score", 50.0):
            grade = "C"
        else:
            grade = "D"

        return {
            "images_analyzed": valid_count,
            "predictions": predictions,
            "quality_score": total_score,
            "grade": grade,
            "defects": detected_defects,
            "score_breakdown": {
                "freshness": round(freshness_score, 1),
                "defect_free": round(defect_free_score, 1),
                "ripeness": round(ripeness_score, 1),
                "uniformity": round(uniformity_score, 1)
            }
        }

grading_engine = PotatoGradingEngine()
