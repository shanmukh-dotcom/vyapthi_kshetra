# Vyapti Kshetra — Potato AI Vision, Grading & RAG Integration Guide

This guide documents the **Potato AI Vision Inference, Local RAG Pipeline, and Deterministic Grading Engine** connected to the real 10-class potato dataset.

---

## 📌 Architecture & Decision Flow

```
[1 to 3 Potato Images Uploaded by Farmer]
       ↓
Potato Vision Model (backend/models/potato/potato_model.joblib)
       ↓
Per-Image Class Predictions & Confidence Scores (e.g. common_scab, 0.82)
       ↓
Detected Defects Aggregation & Severity Mapping
       ↓
Deterministic Grading Engine (backend/services/potato_grading.py)
  - Evaluates freshness, defect_free, ripeness, uniformity
  - Computes Quality Score (0-100) & Grade (A/B/C/D) via grading_rules.json
       ↓
Local RAG Retriever (backend/services/rag_retriever.py)
  - Searches backend/modules/potato_ai/knowledge/ (defects, guidelines, recommendations)
  - Retrieves relevant knowledge chunks & source IDs (knowledge_sources)
       ↓
Gemini AI Explanation Engine (backend/services/gemini.py)
  - Synthesizes retrieved chunks into farmer-friendly explanations
  - IMPORTANT: Cannot override or alter the deterministically calculated grade
```

---

## 📊 Dataset & Model Specifications

- **Dataset Location**: `backend/potato_dataset/`
- **Total Images**: 3,905 valid images (0 corrupted)
- **Classes (10)**:
  - `healthy`: 815 images (Healthy Potatoes)
  - `dry_rot`: 1,355 images
  - `blackspot_bruising`: 770 images
  - `soft_rot`: 560 images
  - `brown_rot`: 105 images
  - `miscellaneous`: 74 images
  - `blackleg`: 60 images
  - `common_scab`: 60 images
  - `pink_rot`: 57 images
  - `black_scurf`: 49 images
- **Dataset Split**: Stratified 70% Train (2,733), 15% Validation (586), 15% Test (586)
- **Model Architecture**: Balanced Random Forest Classifier (120 Estimators) trained on 164-dimensional computer vision feature vectors (Color moments in RGB + HSV, spatial 3x3 block color statistics, texture & gradient magnitude histograms).
- **Model Location**: `backend/models/potato/potato_model.joblib` (3.19 MB)
- **Evaluation on Held-out Test Set (586 images)**:
  - **Test Accuracy**: `83.62%`
  - **Weighted F1 Score**: `0.8216`
  - **Healthy Class F1 Score**: `0.992` (Precision: 98.4%, Recall: 100.0%)
  - **Blackspot Bruising F1 Score**: `0.863`
  - **Dry Rot F1 Score**: `0.841`
  - **Soft Rot F1 Score**: `0.781`

---

## 🚀 API Endpoint

### `POST /api/potato/analyze`

#### Request JSON:
```json
{
  "crop": "Potato",
  "quantity_kg": 2000,
  "images": [
    "sample_potato_img_01.jpg",
    "sample_potato_img_02.jpg"
  ],
  "batch_notes": "Fresh harvest batch from Krishna District"
}
```

#### Response JSON (`200 OK`):
```json
{
  "success": true,
  "crop": "Potato",
  "images_analyzed": 2,
  "predictions": [
    {
      "class": "healthy",
      "confidence": 0.859,
      "display_name": "Healthy Potatoes",
      "is_healthy": true
    },
    {
      "class": "common_scab",
      "confidence": 0.617,
      "display_name": "Common Scab",
      "is_healthy": false
    }
  ],
  "quality_score": 90.1,
  "grade": "A",
  "defects": [
    {
      "type": "common_scab",
      "confidence": 0.617,
      "severity": "moderate",
      "display_name": "Common Scab"
    }
  ],
  "score_breakdown": {
    "freshness": 35.0,
    "defect_free": 18.8,
    "ripeness": 20.0,
    "uniformity": 16.3
  },
  "explanation": "Your Potato crop batch achieved Grade A with an overall quality score of 90.1/100...",
  "recommendations": [
    "Maintain cold storage temperature between 7°C and 10°C with 85-90% relative humidity.",
    "Stack jute bags no higher than 8 layers in transit trucks.",
    "Allow batch temperature to equalize above 8°C prior to industrial factory washing."
  ],
  "knowledge_sources": [
    "defect_scab_001",
    "quality_guideline_002",
    "standard_healthy_001"
  ],
  "analyzed_at": "2026-09-16T11:14:45.000Z"
}
```

---

## 📂 Git & Dataset Storage Recommendation

- **Raw Dataset (`backend/potato_dataset/`, 88.5 MB)**:
  - Excluded from git via `.gitignore` to avoid repository bloat.
  - Can remain local or be archived in external cloud storage (S3/Drive) if team members need the raw training images.
- **Trained Model (`backend/models/potato/potato_model.joblib`, 3.19 MB)**:
  - Committed to version control so team members can run inference instantly without retraining.
