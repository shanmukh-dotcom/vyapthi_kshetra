# VYAPTI KSHETRA - Potato Market Data Engine
## Data Sources

The following sources were used or evaluated to generate the verified and synthetic datasets.

| Source | Organization | Dataset/Page | URL | Date Accessed | What Data Was Obtained |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Agmarknet | Directorate of Marketing & Inspection, GoI | Daily Price and Arrival Report | [agmarknet.gov.in](https://agmarknet.gov.in) | 2026-09-16 | Benchmark verified daily prices (~₹1,600/quintal) for September 2026. |
| data.gov.in | OGD Platform India | Variety-wise Daily Market Prices | [data.gov.in](https://data.gov.in) | 2026-09-16 | Evaluated for historical dataset access. |

### Note on Data Availability
Comprehensive historical open-access APIs for Krishna District potato prices required authentication or manual CAPTCHA-bypassing via Agmarknet. Therefore, a small set of current `VERIFIED` benchmarks was obtained via search verification, and the historical records (2021-2026) were derived `SYNTHETIC` data points, modelled after realistic Indian market seasonality and inflation trends.
