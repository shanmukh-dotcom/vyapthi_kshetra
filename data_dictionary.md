# VYAPTI KSHETRA - Potato Market Data Engine
## Data Dictionary

This data dictionary explains every column present in the master dataset (`krishna_potato_market_master.csv`).

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | Unique identifier for each observation. |
| `date` | Date | The date of the market observation (YYYY-MM-DD). |
| `state` | String | State where the market is located (e.g., Andhra Pradesh). |
| `district` | String | District where the market is located (e.g., Krishna). |
| `market` | String | Name of the specific agricultural market/mandi. |
| `commodity` | String | The crop being traded (Potato). |
| `variety` | String | Variety of the commodity (e.g., Local). |
| `min_price_quintal` | Integer | Minimum price observed on the date, in ₹ per quintal. |
| `max_price_quintal` | Integer | Maximum price observed on the date, in ₹ per quintal. |
| `modal_price_quintal`| Integer | The most commonly occurring (mode) price, in ₹ per quintal. |
| `min_price_kg` | Float | Minimum price observed on the date, in ₹ per kilogram. |
| `max_price_kg` | Float | Maximum price observed on the date, in ₹ per kilogram. |
| `modal_price_kg` | Float | The most commonly occurring price, in ₹ per kilogram. |
| `arrivals` | Integer | Total volume of the commodity arriving at the market (in `original_unit`). |
| `original_unit` | String | The unit of measurement as reported by the source (Quintal). |
| `original_price` | Integer | The original reported modal price before any adjustments. |
| `source` | String | The source of the data observation (e.g., Agmarknet, VYAPTI Synthetic Data Engine). |
| `source_url` | String | The URL of the data source, if applicable. |
| `data_status` | String | Status of the data: `VERIFIED` (real observation), `SYNTHETIC` (modelled data), or `FORECAST`. |
| `quality_flag` | String | Flag indicating data quality: `NORMAL`, `OUTLIER`, `DATA_GAP`. |
| `generation_method`| String | How the data was generated if synthetic (e.g., 'seasonality + stochastic variation'). |
| `observation_frequency` | String | Frequency of data point: `DAILY`, `SYNTHETIC_DAILY`. |
