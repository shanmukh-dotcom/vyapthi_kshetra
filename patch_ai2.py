import re

with open('farmer-grade-sell.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the incorrect simulated data block with the correct one
fake_vision_block = """
          // Simulated Vision AI Backend
          await new Promise(resolve => setTimeout(resolve, 2000));
          const response = { ok: true };
          const data = {
            success: true,
            grade: "A",
            quality_score: 94,
            score_breakdown: {
              uniformity: 18,
              freshness: 32,
              ripeness: 19
            },
            defects: [],
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

# Regex to find the previously injected mock
content = re.sub(r'// Simulated Vision AI Backend\s+await new Promise.*?quality_reason:.*?};', fake_vision_block, content, flags=re.DOTALL)

with open('farmer-grade-sell.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched farmer-grade-sell.html with correct schema")
