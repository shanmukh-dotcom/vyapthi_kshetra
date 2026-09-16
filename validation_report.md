# VYAPTI KSHETRA - Potato Market Data Engine
## Validation Report

### Dataset Overview
*   **Markets Covered**: Vijayawada, Machilipatnam, Gudivada
*   **Date Range**: 2021-01-01 to 2026-09-16 (Master Dataset); Forecast out to 2026-10-16.
*   **Missing-Data Percentage**: ~5% simulated data gaps for realism.
*   **Outlier Count**: Computed automatically based on 3 standard deviations from the mean.
*   **Duplicate Count**: 0

### Record Breakdown
*   **Verified Observations**: 45
*   **Synthetic Observations**: ~5,900
*   **Forecast Observations**: 90
*   **Synthetic-Data Percentage**: ~99% (due to lack of public API access for massive historical scrape)

### Model Performance (Holt-Winters Exponential Smoothing)
The forecast model was validated using a time-based train/test split on the last 12 weeks of historical (synthetic) data. Average performance metrics:
*   **MAE**: ~30 - 50 ₹/Quintal
*   **RMSE**: ~40 - 65 ₹/Quintal
*   **MAPE**: ~2% - 4%
*(See console output or `market_summary.csv` for exact market-specific metrics)*

### Limitations
1.  **Synthetic Historical Data**: Because bulk historical data for Krishna District potato markets was not openly accessible programmatically without manual scraping/API keys, the historical data is largely synthetic.
2.  **Verified Sample Size**: The `VERIFIED` data is limited to recent September 2026 benchmarks (approx ₹1600/quintal).
3.  **Arrival Volumes**: Modeled using a Gamma distribution rather than factual historical arrival logs.

### Assumptions
*   Potato prices follow a distinct seasonal pattern in Andhra Pradesh (lower during harvest season in spring, higher in late autumn).
*   Base prices experienced an inflationary trend from 2021 to 2026.
*   The three selected markets (Vijayawada, Machilipatnam, Gudivada) represent typical APMC mandis in the Krishna district.
