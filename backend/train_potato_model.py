"""
Potato Vision Model Training & Evaluation Pipeline
- Dataset: backend/potato_dataset/ (10 classes, 3,905 images)
- Stratified Split: 70% Train, 15% Validation, 15% Test
- Feature Extraction: Multi-channel Color Moments, HSV Histograms, Spatial Block Distributions, Gradient/Texture
- Classifier: Calibrated Balanced Random Forest
- Output: backend/models/potato/potato_model.joblib, class_mapping.json, evaluation_metrics.json, dataset_split.json
"""

import os
import sys
import json
import time
import numpy as np
from PIL import Image
from collections import Counter
from sklearn.model_selection import StratifiedShuffleSplit
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report, confusion_matrix
import joblib

DATASET_DIR = os.path.join(os.path.dirname(__file__), "potato_dataset")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models", "potato")
os.makedirs(MODEL_DIR, exist_ok=True)

CLASS_MAPPING = {
    "Black Scurf": "black_scurf",
    "Blackleg": "blackleg",
    "Blackspot Bruising": "blackspot_bruising",
    "Brown Rot": "brown_rot",
    "Common Scab": "common_scab",
    "Dry Rot": "dry_rot",
    "Healthy Potatoes": "healthy",
    "Miscellaneous": "miscellaneous",
    "Pink Rot": "pink_rot",
    "Soft Rot": "soft_rot"
}

def extract_features_from_pil(img: Image.Image) -> np.ndarray:
    """
    Extracts rich, normalized computer vision feature vector from a PIL Image:
    - 224x224 normalized resize
    - RGB & HSV global statistics and channel histograms
    - Spatial 3x3 block statistics (localized color & texture features)
    - Gradient/edge magnitude distribution (roughness / scab / rot markers)
    """
    if img.mode != "RGB":
        img = img.convert("RGB")
    
    img_resized = img.resize((128, 128))
    rgb_arr = np.array(img_resized, dtype=np.float32) / 255.0  # (128, 128, 3)
    
    # 1. Global RGB Moments
    r = rgb_arr[:, :, 0]
    g = rgb_arr[:, :, 1]
    b = rgb_arr[:, :, 2]
    
    r_mean, r_std = float(np.mean(r)), float(np.std(r))
    g_mean, g_std = float(np.mean(g)), float(np.std(g))
    b_mean, b_std = float(np.mean(b)), float(np.std(b))
    
    # Global RGB Histograms (12 bins each)
    r_hist, _ = np.histogram(r, bins=12, range=(0.0, 1.0), density=True)
    g_hist, _ = np.histogram(g, bins=12, range=(0.0, 1.0), density=True)
    b_hist, _ = np.histogram(b, bins=12, range=(0.0, 1.0), density=True)
    
    # 2. HSV Color Space Conversion
    hsv_img = img_resized.convert("HSV")
    hsv_arr = np.array(hsv_img, dtype=np.float32) / 255.0
    h = hsv_arr[:, :, 0]
    s = hsv_arr[:, :, 1]
    v = hsv_arr[:, :, 2]
    
    h_mean, h_std = float(np.mean(h)), float(np.std(h))
    s_mean, s_std = float(np.mean(s)), float(np.std(s))
    v_mean, v_std = float(np.mean(v)), float(np.std(v))
    
    # HSV Histograms: 16 bins for Hue, 8 for S, 8 for V
    h_hist, _ = np.histogram(h, bins=16, range=(0.0, 1.0), density=True)
    s_hist, _ = np.histogram(s, bins=8, range=(0.0, 1.0), density=True)
    v_hist, _ = np.histogram(v, bins=8, range=(0.0, 1.0), density=True)
    
    # 3. Spatial 3x3 Block Statistics (localized lesion detection)
    block_stats = []
    h_step = 128 // 3
    w_step = 128 // 3
    for bi in range(3):
        for bj in range(3):
            sub_r = r[bi*h_step:(bi+1)*h_step, bj*w_step:(bj+1)*w_step]
            sub_g = g[bi*h_step:(bi+1)*h_step, bj*w_step:(bj+1)*w_step]
            sub_b = b[bi*h_step:(bi+1)*h_step, bj*w_step:(bj+1)*w_step]
            sub_h = h[bi*h_step:(bi+1)*h_step, bj*w_step:(bj+1)*w_step]
            block_stats.extend([
                float(np.mean(sub_r)), float(np.std(sub_r)),
                float(np.mean(sub_g)), float(np.std(sub_g)),
                float(np.mean(sub_b)), float(np.std(sub_b)),
                float(np.mean(sub_h)), float(np.std(sub_h))
            ])
            
    # 4. Texture / Gradient Magnitude (Roughness / Scab / Rot lesions)
    gray = np.mean(rgb_arr, axis=2)
    diff_x = np.abs(np.diff(gray, axis=1))
    diff_y = np.abs(np.diff(gray, axis=0))
    grad_mag = diff_x[:127, :] + diff_y[:, :127]
    grad_mean = float(np.mean(grad_mag))
    grad_std = float(np.std(grad_mag))
    grad_hist, _ = np.histogram(grad_mag, bins=10, range=(0.0, 0.5), density=True)
    
    # Concatenate all features into single 1D vector
    features = np.concatenate([
        [r_mean, r_std, g_mean, g_std, b_mean, b_std],
        r_hist, g_hist, b_hist,
        [h_mean, h_std, s_mean, s_std, v_mean, v_std],
        h_hist, s_hist, v_hist,
        block_stats,
        [grad_mean, grad_std],
        grad_hist
    ]).astype(np.float32)
    
    return features

def load_and_extract_dataset():
    print(f"Inspecting dataset directory: {DATASET_DIR}")
    image_paths = []
    labels = []
    raw_classes = sorted([d for d in os.listdir(DATASET_DIR) if os.path.isdir(os.path.join(DATASET_DIR, d))])
    
    print(f"Found {len(raw_classes)} class folders: {raw_classes}")
    for raw_cls in raw_classes:
        standard_label = CLASS_MAPPING.get(raw_cls, raw_cls.lower().replace(" ", "_"))
        cls_folder = os.path.join(DATASET_DIR, raw_cls)
        for fname in os.listdir(cls_folder):
            ext = os.path.splitext(fname)[1].lower()
            if ext in [".jpg", ".jpeg", ".png"]:
                fpath = os.path.join(cls_folder, fname)
                image_paths.append(fpath)
                labels.append(standard_label)
                
    print(f"Total valid images located: {len(image_paths)}")
    print(f"Class distribution: {Counter(labels)}")
    
    return image_paths, labels

def main():
    start_time = time.time()
    image_paths, labels = load_and_extract_dataset()
    
    # Create Stratified 70% Train, 15% Val, 15% Test Split
    print("\nCreating stratified 70% train / 15% val / 15% test splits...")
    unique_classes = sorted(list(set(labels)))
    class_to_idx = {cls: idx for idx, cls in enumerate(unique_classes)}
    idx_to_class = {idx: cls for cls, idx in class_to_idx.items()}
    y = np.array([class_to_idx[l] for l in labels])
    
    # First split: 70% train vs 30% temp (val + test)
    sss_1 = StratifiedShuffleSplit(n_splits=1, test_size=0.30, random_state=42)
    train_idx, temp_idx = next(sss_1.split(image_paths, y))
    
    # Second split: split 30% temp equally into 15% val and 15% test
    y_temp = y[temp_idx]
    sss_2 = StratifiedShuffleSplit(n_splits=1, test_size=0.50, random_state=42)
    val_sub_idx, test_sub_idx = next(sss_2.split(temp_idx, y_temp))
    val_idx = temp_idx[val_sub_idx]
    test_idx = temp_idx[test_sub_idx]
    
    print(f"Split sizes: Train={len(train_idx)}, Val={len(val_idx)}, Test={len(test_idx)}")
    
    # Save Split configuration metadata
    split_meta = {
        "total_images": len(image_paths),
        "classes": unique_classes,
        "class_mapping": CLASS_MAPPING,
        "counts": {
            "train": int(len(train_idx)),
            "validation": int(len(val_idx)),
            "test": int(len(test_idx))
        },
        "train_indices_count": len(train_idx),
        "val_indices_count": len(val_idx),
        "test_indices_count": len(test_idx)
    }
    with open(os.path.join(MODEL_DIR, "dataset_split.json"), "w", encoding="utf-8") as f:
        json.dump(split_meta, f, indent=2)
        
    with open(os.path.join(MODEL_DIR, "class_mapping.json"), "w", encoding="utf-8") as f:
        json.dump(CLASS_MAPPING, f, indent=2)
        
    print("\nExtracting feature vectors from images...")
    X_all = []
    t_feat0 = time.time()
    for i, path in enumerate(image_paths):
        try:
            with Image.open(path) as img:
                feat = extract_features_from_pil(img)
                X_all.append(feat)
        except Exception as e:
            print(f"Warning: Failed to process image {path}: {e}")
            X_all.append(np.zeros(160, dtype=np.float32))
            
        if (i + 1) % 500 == 0 or (i + 1) == len(image_paths):
            print(f"Processed {i+1}/{len(image_paths)} images ({time.time()-t_feat0:.1f}s)...", flush=True)
            
    X_all = np.array(X_all, dtype=np.float32)
    print(f"Feature matrix shape: {X_all.shape} in {time.time()-t_feat0:.2f}s")
    
    X_train, y_train = X_all[train_idx], y[train_idx]
    X_val, y_val = X_all[val_idx], y[val_idx]
    X_test, y_test = X_all[test_idx], y[test_idx]
    
    print("\nTraining Classifier (Balanced Random Forest)...")
    clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=16,
        class_weight="balanced_subsample",
        random_state=42,
        n_jobs=-1
    )
    t_train0 = time.time()
    clf.fit(X_train, y_train)
    print(f"Training completed in {time.time()-t_train0:.2f}s")
    
    # Evaluate on Validation Set
    val_preds = clf.predict(X_val)
    val_acc = accuracy_score(y_val, val_preds)
    print(f"\nValidation Accuracy: {val_acc * 100:.2f}%")
    
    # Evaluate on Held-out Test Set
    print("\nEvaluating on Held-Out Test Set...")
    test_preds = clf.predict(X_test)
    test_acc = float(accuracy_score(y_test, test_preds))
    
    prec_macro, rec_macro, f1_macro, _ = precision_recall_fscore_support(y_test, test_preds, average="macro", zero_division=0)
    prec_weighted, rec_weighted, f1_weighted, _ = precision_recall_fscore_support(y_test, test_preds, average="weighted", zero_division=0)
    
    target_names = [idx_to_class[i] for i in range(len(unique_classes))]
    clf_report = classification_report(y_test, test_preds, target_names=target_names, output_dict=True, zero_division=0)
    cm = confusion_matrix(y_test, test_preds).tolist()
    
    print("=" * 60)
    print(f"TEST ACCURACY:       {test_acc * 100:.2f}%")
    print(f"MACRO F1 SCORE:      {f1_macro:.4f}")
    print(f"WEIGHTED F1 SCORE:   {f1_weighted:.4f}")
    print("=" * 60)
    print("\nPer-Class Breakdown:")
    for cls_name in target_names:
        stats = clf_report[cls_name]
        print(f"  {cls_name:20s}: Precision={stats['precision']:.3f}, Recall={stats['recall']:.3f}, F1={stats['f1-score']:.3f}, Support={stats['support']}")
    print("=" * 60)
    
    # Save Model Artifacts
    model_artifact = {
        "model": clf,
        "classes": unique_classes,
        "class_to_idx": class_to_idx,
        "idx_to_class": idx_to_class,
        "feature_dim": X_all.shape[1],
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    model_path = os.path.join(MODEL_DIR, "potato_model.joblib")
    joblib.dump(model_artifact, model_path, compress=3)
    print(f"\nSaved trained model artifact to: {model_path} ({os.path.getsize(model_path) / (1024*1024):.2f} MB)")
    
    # Save Evaluation Metrics JSON
    metrics_summary = {
        "model_type": "Balanced Random Forest (120 Estimators)",
        "features": "Color Moments (RGB+HSV), Spatial 3x3 Block Moments, Gradient/Edge Texture",
        "test_accuracy": round(test_acc, 4),
        "macro_precision": round(float(prec_macro), 4),
        "macro_recall": round(float(rec_macro), 4),
        "macro_f1": round(float(f1_macro), 4),
        "weighted_f1": round(float(f1_weighted), 4),
        "per_class": {
            cls_name: {
                "precision": round(clf_report[cls_name]["precision"], 4),
                "recall": round(clf_report[cls_name]["recall"], 4),
                "f1_score": round(clf_report[cls_name]["f1-score"], 4),
                "support": int(clf_report[cls_name]["support"])
            }
            for cls_name in target_names
        },
        "confusion_matrix": cm,
        "classes": target_names,
        "evaluated_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    with open(os.path.join(MODEL_DIR, "evaluation_metrics.json"), "w", encoding="utf-8") as f:
        json.dump(metrics_summary, f, indent=2)
    print(f"Saved evaluation metrics to: {os.path.join(MODEL_DIR, 'evaluation_metrics.json')}")
    print(f"Total pipeline execution time: {time.time() - start_time:.2f}s")

if __name__ == "__main__":
    main()
