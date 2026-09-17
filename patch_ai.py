import re

with open('farmer-grade-sell.html', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the fetch('http://localhost:8001/api/potato/analyze') block with a fake response simulation
# And the fetch('http://localhost:8001/api/logistics/providers/nearby') block

fake_vision_block = """
          // Simulated Vision AI Backend
          await new Promise(resolve => setTimeout(resolve, 2000));
          const response = { ok: true };
          const data = {
            success: true,
            grading: {
              grade: "Grade A",
              size_classification: "Large (45-60mm)",
              defect_percentage: "2.1%",
              freshness_score: "94/100",
              estimated_shelf_life_days: 21,
              confidence_score: "98.5%"
            },
            market_guidance: {
              recommended_price_min: 1450,
              recommended_price_max: 1680,
              market_sentiment: "High Demand",
              nearest_mandi: "Vijayawada APMC"
            },
            overall_assessment: "Grade A Potato Assessment",
            quality_reason: "High quality potatoes with very low defects and excellent freshness. Suitable for premium retail."
          };
"""

content = re.sub(r'const response = await fetch\(\'http://localhost:8001/api/potato/analyze\'.*?const data = await response\.json\(\);', fake_vision_block, content, flags=re.DOTALL)


fake_logistics_block = """
              // Simulated Logistics Backend
              await new Promise(resolve => setTimeout(resolve, 1000));
              const transportData = {
                success: true,
                count: 3,
                providers: [
                  { name: "Ravi Transport", distance_km: 4.2, vehicle_type: "Tata Ace", capacity_kg: 750, rate_per_km: 14 },
                  { name: "Lakshmi Logistics", distance_km: 8.5, vehicle_type: "Mahindra Bolero", capacity_kg: 1200, rate_per_km: 18 },
                  { name: "Kisan Cargo", distance_km: 12.1, vehicle_type: "Eicher Pro", capacity_kg: 4000, rate_per_km: 35 }
                ]
              };
"""

content = re.sub(r'const transportRes = await fetch\(\'http://localhost:8001/api/logistics/providers/nearby\?.*?\);.*?const transportData = await transportRes\.json\(\);', fake_logistics_block, content, flags=re.DOTALL)

with open('farmer-grade-sell.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched farmer-grade-sell.html")
