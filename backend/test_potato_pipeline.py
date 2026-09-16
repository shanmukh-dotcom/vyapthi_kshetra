import os
import sys
import json
import requests

dataset_dir = os.path.join(os.path.dirname(__file__), "potato_dataset")
classes_to_test = [
    "Healthy Potatoes",
    "Common Scab",
    "Dry Rot",
    "Soft Rot",
    "Brown Rot",
    "Blackspot Bruising"
]

print("=" * 70)
print("1. TESTING POTATO VISION & ENDPOINT WITH REAL DATASET IMAGES")
print("=" * 70)

for cls in classes_to_test:
    cls_folder = os.path.join(dataset_dir, cls)
    imgs = [os.path.join(cls_folder, f) for f in os.listdir(cls_folder) if f.lower().endswith((".jpg", ".png"))]
    if not imgs:
        continue
    sample_img = imgs[0]
    
    payload = {
        "crop": "Potato",
        "quantity_kg": 2000.0,
        "images": [sample_img],
        "batch_notes": f"Inspection sample of {cls}"
    }
    
    res = requests.post("http://127.0.0.1:8000/api/potato/analyze", json=payload, timeout=10.0)
    if res.status_code == 200:
        data = res.json()
        pred = data["predictions"][0]
        print(f"Test Class: [{cls}]")
        print(f"  -> Predicted Class: {pred['class']} (conf: {pred['confidence']})")
        print(f"  -> Calculated Grade: {data['grade']}, Quality Score: {data['quality_score']}/100")
        print(f"  -> Defects: {[d['type'] for d in data['defects']]}")
        print(f"  -> RAG Knowledge Sources: {data['knowledge_sources']}")
        print(f"  -> Explanation: {data['explanation'][:100]}...")
        print("-" * 70)
    else:
        print(f"FAILED for {cls}: Status {res.status_code}, {res.text}")

print("\n" + "=" * 70)
print("2. TESTING MULTI-IMAGE ANALYSIS (1, 2, 3 IMAGES)")
print("=" * 70)

healthy_img = os.path.join(dataset_dir, "Healthy Potatoes", os.listdir(os.path.join(dataset_dir, "Healthy Potatoes"))[0])
scab_img = os.path.join(dataset_dir, "Common Scab", os.listdir(os.path.join(dataset_dir, "Common Scab"))[0])
rot_img = os.path.join(dataset_dir, "Dry Rot", os.listdir(os.path.join(dataset_dir, "Dry Rot"))[0])

for num_imgs, test_set in [(1, [healthy_img]), (2, [healthy_img, scab_img]), (3, [healthy_img, scab_img, rot_img])]:
    payload = {
        "crop": "Potato",
        "quantity_kg": 2500.0,
        "images": test_set,
        "batch_notes": f"Multi-image batch with {num_imgs} images"
    }
    res = requests.post("http://127.0.0.1:8000/api/potato/analyze", json=payload, timeout=10.0)
    data = res.json()
    print(f"Multi-Image Test ({num_imgs} images uploaded):")
    print(f"  -> images_analyzed: {data['images_analyzed']}")
    print(f"  -> predictions: {[(p['class'], p['confidence']) for p in data['predictions']]}")
    print(f"  -> Grade: {data['grade']}, Score: {data['quality_score']}")
    print(f"  -> Breakdown: {data['score_breakdown']}")
    print("-" * 70)

print("\n" + "=" * 70)
print("3. REGRESSION CHECK ON TRANSPORT MODULE")
print("=" * 70)
match_res = requests.post("http://127.0.0.1:8000/api/logistics/match", json={
    "deal_id": "deal_potato_88",
    "crop": "Potato",
    "quantity_kg": 2000.0,
    "farmer_lat": 16.4410,
    "farmer_lng": 80.9926,
    "factory_lat": 16.5062,
    "factory_lng": 80.6480,
    "farmer_address": "Gudivada, Krishna District, AP",
    "factory_address": "Auto Nagar, Vijayawada, AP"
}, timeout=10.0)
print(f"Logistics Match API Status: {match_res.status_code}")
if match_res.status_code == 200:
    transporters = match_res.json().get("transport_options", [])
    print(f"Logistics Transporters matched: {len(transporters)}")
    if transporters:
        print(f"Top matched provider: {transporters[0]['name']} ({transporters[0]['vehicle_type']}), Est Cost: Rs {transporters[0]['estimated_cost']}")
print("=" * 70)
