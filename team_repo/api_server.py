from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

app = FastAPI(title="VYAPTI KSHETRA - Fair Price & Market API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Datasets
DATA_DIR = r"c:\Users\chenn\OneDrive\Documents\Desktop\VYAPTHI KSHETRA"
MASTER_CSV = os.path.join(DATA_DIR, "krishna_potato_market_master.csv")
FORECAST_CSV = os.path.join(DATA_DIR, "krishna_potato_forecast.csv")

# We load data once when server starts
df_master = pd.read_csv(MASTER_CSV)
df_master['date'] = pd.to_datetime(df_master['date'])

df_forecast = pd.read_csv(FORECAST_CSV)
df_forecast['forecast_date'] = pd.to_datetime(df_forecast['forecast_date'])

@app.get("/api/v1/market/dashboard")
def get_market_dashboard(market_name: str = "Vijayawada", commodity: str = "Potato"):
    """
    Returns the core data needed for the Farmer Market & Fair Price UI.
    """
    # Filter data for specific market
    df_mkt = df_master[(df_master['market'] == market_name) & (df_master['commodity'] == commodity)].sort_values('date')
    
    if df_mkt.empty:
        return {"error": "Market data not found"}

    latest_record = df_mkt.iloc[-1]
    current_date = latest_record['date']
    current_price = latest_record['modal_price_quintal']
    
    # Calculate 7-day trend
    date_7d_ago = current_date - timedelta(days=7)
    df_7d = df_mkt[df_mkt['date'] <= date_7d_ago]
    price_7d = df_7d.iloc[-1]['modal_price_quintal'] if not df_7d.empty else current_price
    trend_7d_pct = round(((current_price - price_7d) / price_7d) * 100, 2)
    
    # Calculate 30-day trend
    date_30d_ago = current_date - timedelta(days=30)
    df_30d = df_mkt[df_mkt['date'] <= date_30d_ago]
    price_30d = df_30d.iloc[-1]['modal_price_quintal'] if not df_30d.empty else current_price
    trend_30d_pct = round(((current_price - price_30d) / price_30d) * 100, 2)

    # Nearby Market Comparison
    nearby_markets = df_master[(df_master['date'] == current_date) & (df_master['market'] != market_name)]
    nearby_prices = [
        {"market": row['market'], "price_quintal": row['modal_price_quintal']} 
        for _, row in nearby_markets.iterrows()
    ]

    return {
        "district": "Krishna",
        "commodity": commodity,
        "market": market_name,
        "current_market_price_quintal": float(current_price),
        "current_market_price_kg": float(latest_record['modal_price_kg']),
        "trend_7_day_pct": trend_7d_pct,
        "trend_30_day_pct": trend_30d_pct,
        "data_status": latest_record['data_status'],
        "confidence": "HIGH" if latest_record['data_status'] == 'VERIFIED' else "MEDIUM",
        "nearby_markets": nearby_prices
    }

@app.get("/api/v1/market/fair-price")
def get_fair_price(market_name: str = "Vijayawada", commodity: str = "Potato", grade: str = "Standard"):
    """
    VYAPTI Indicative Fair Range Calculator.
    Considers recent price, volatility, and grading.
    """
    df_mkt = df_master[(df_master['market'] == market_name) & (df_master['commodity'] == commodity)].sort_values('date')
    
    # Base calculation on last 14 days of data
    recent_data = df_mkt.tail(14)
    base_price = recent_data['modal_price_quintal'].mean()
    volatility = recent_data['modal_price_quintal'].std()
    
    # Apply Quality Grading Multiplier
    grade_multiplier = {"Premium": 1.15, "Standard": 1.0, "Low": 0.85}.get(grade, 1.0)
    
    adjusted_base = base_price * grade_multiplier
    
    # Indicative Range (± 1 standard deviation for buffer)
    lower_bound = round(adjusted_base - (volatility * 0.5))
    upper_bound = round(adjusted_base + (volatility * 0.5))

    return {
        "vyapti_indicative_fair_range_quintal": [lower_bound, upper_bound],
        "vyapti_indicative_fair_range_kg": [round(lower_bound/100, 1), round(upper_bound/100, 1)],
        "grade_applied": grade,
        "confidence": "MEDIUM",
        "reason": f"Based on 14-day trailing average with {grade} grade adjustment and local volatility."
    }

@app.get("/api/v1/market/chart-data")
def get_chart_data(market_name: str = "Vijayawada", days: int = 90):
    """
    Provides time-series data for the UI historical charts and forecasts.
    """
    # Historical Data
    df_mkt = df_master[df_master['market'] == market_name].sort_values('date').tail(days)
    
    historical = []
    for _, row in df_mkt.iterrows():
        historical.append({
            "date": row['date'].strftime('%Y-%m-%d'),
            "price": row['modal_price_quintal'],
            "status": row['data_status']
        })
        
    # Forecast Data
    df_fc = df_forecast[df_forecast['market'] == market_name].sort_values('forecast_date').head(15)
    
    forecast = []
    for _, row in df_fc.iterrows():
        forecast.append({
            "date": row['forecast_date'].strftime('%Y-%m-%d'),
            "predicted_price": row['predicted_modal_price'],
            "lower_bound": row['lower_bound'],
            "upper_bound": row['upper_bound']
        })

    return {
        "historical": historical,
        "forecast": forecast
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
