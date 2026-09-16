from fastapi import APIRouter, HTTPException
import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from services.vision_ai_grading import vision_ai_grading_pipeline
from services.potato_grading import grading_engine

router = APIRouter(prefix="/api/potato", tags=["potato_ai"])

class PotatoAnalyzeRequest(BaseModel):
    crop: str = Field("Potato", example="Potato")
    quantity_kg: float = Field(..., example=2000.0)
    images: Optional[List[str]] = Field(default_factory=list, description="List of 1 to 3 image URLs/base64 strings/filepaths")
    batch_notes: Optional[str] = Field("Fresh harvest batch from Krishna District", example="Fresh harvest batch")

class DefectItem(BaseModel):
    name: Optional[str] = None
    type: str
    confidence: float
    severity: str = "moderate"
    display_name: Optional[str] = None
    evidence: Optional[str] = None

class PredictionItem(BaseModel):
    class_: str = Field(alias="class")
    confidence: float
    display_name: Optional[str] = None
    is_healthy: bool = False

    class Config:
        populate_by_name = True

class ScoreBreakdown(BaseModel):
    freshness: float
    defect_free: float
    ripeness: float
    uniformity: float

class PotatoAnalyzeResponse(BaseModel):
    success: bool = True
    crop: str
    images_analyzed: int
    predictions: List[PredictionItem] = Field(default_factory=list)
    quality_score: float
    grade: str
    defects: List[DefectItem]
    score_breakdown: ScoreBreakdown
    overall_assessment: Optional[str] = None
    explanation: str
    quality_reason: Optional[str] = None
    recommendations: List[str]
    knowledge_sources: List[str]
    healthy_percentage_estimate: Optional[float] = None
    pipeline_type: Optional[str] = "vision_ai_rag"
    is_valid_potato: Optional[bool] = True
    validation_message: Optional[str] = None
    analyzed_at: datetime.datetime

@router.post("/analyze", response_model=PotatoAnalyzeResponse)
def analyze_potato_crop(payload: PotatoAnalyzeRequest):
    """
    Multimodal Vision AI + Local RAG Agricultural Quality Grading Endpoint.
    1. Validates uploaded images (potato presence, blurriness, quality).
    2. Multimodal Vision Model (Gemini 2.5 Flash) inspects image pixels directly.
    3. Retrieves local RAG agricultural knowledge chunks (defects, tolerances, recommendations).
    4. Synthesizes final grade (A/B/C/D) and score (0-100) reflecting true visible conditions.
    5. Gracefully falls back to localized grading engine if external API is unreachable.
    """
    if payload.quantity_kg <= 0:
        raise HTTPException(status_code=400, detail="Crop quantity_kg must be greater than 0.")

    sample_imgs = payload.images if payload.images else ["sample_potato_img_01.jpg"]

    # Execute Vision-AI + RAG Grading Pipeline
    result = vision_ai_grading_pipeline.analyze_batch(
        image_samples=sample_imgs,
        batch_notes=payload.batch_notes or "",
        quantity_kg=payload.quantity_kg
    )

    # Format predictions
    formatted_predictions = []
    for p in result.get("predictions", []):
        formatted_predictions.append(PredictionItem(
            class_=p.get("class", "healthy"),
            confidence=float(p.get("confidence", 0.85)),
            display_name=p.get("display_name", "Healthy Potatoes"),
            is_healthy=bool(p.get("is_healthy", True))
        ))

    # Format defects
    formatted_defects = []
    for d in result.get("defects", []):
        formatted_defects.append(DefectItem(
            name=d.get("name") or d.get("type", "").replace("_", " ").title(),
            type=d.get("type", "defect"),
            confidence=float(d.get("confidence", 0.8)),
            severity=d.get("severity", "moderate"),
            display_name=d.get("display_name") or d.get("name"),
            evidence=d.get("evidence", "")
        ))

    breakdown = result.get("score_breakdown", {})
    breakdown_formatted = ScoreBreakdown(
        freshness=float(breakdown.get("freshness", 0.0)),
        defect_free=float(breakdown.get("defect_free", 0.0)),
        ripeness=float(breakdown.get("ripeness", 0.0)),
        uniformity=float(breakdown.get("uniformity", 0.0))
    )

    return PotatoAnalyzeResponse(
        success=bool(result.get("success", True)),
        crop=payload.crop,
        images_analyzed=int(result.get("images_analyzed", len(sample_imgs))),
        predictions=formatted_predictions,
        quality_score=float(result.get("quality_score", 0.0)),
        grade=str(result.get("grade", "N/A")),
        defects=formatted_defects,
        score_breakdown=breakdown_formatted,
        overall_assessment=result.get("overall_assessment"),
        explanation=result.get("explanation") or result.get("quality_reason") or "Potato quality evaluated.",
        quality_reason=result.get("quality_reason"),
        recommendations=result.get("recommendations", []),
        knowledge_sources=result.get("knowledge_sources", []),
        healthy_percentage_estimate=result.get("healthy_percentage_estimate"),
        pipeline_type=result.get("pipeline_type", "vision_ai_rag"),
        is_valid_potato=result.get("is_valid_potato", True),
        validation_message=result.get("validation_message", ""),
        analyzed_at=datetime.datetime.utcnow()
    )
