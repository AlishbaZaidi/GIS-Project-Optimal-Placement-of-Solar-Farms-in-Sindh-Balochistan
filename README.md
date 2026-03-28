# ☀️ Solar Farm Suitability Tool for Sindh & Balochistan

**By Syeda Alishba Zaidi, Huzaifa Ahmed Khan & Aamaina Mukarram**

---

> ⚠️ **Important — Please Read Before Using**
>
> This app processes **large geospatial satellite datasets** (MODIS, NASA NASADEM, ESA WorldCover) through Google Earth Engine.
> After opening the app, please **wait up to 7 minutes** for the suitability analysis to complete and results to appear on the map. This is expected behaviour — the app is not frozen.

---

## 🔗 Live App

👉 **[Open Solar Farm Suitability Tool](https://ee-hakhuzaifa.projects.earthengine.app/view/solar-farm-suitability-tool-for-sindh-and-balochistan)**

---

## 📌 Problem Statement

Pakistan's Sindh and Balochistan provinces receive some of the highest solar radiation in the world, yet identifying truly suitable land for solar farms requires simultaneous analysis of solar potential, terrain, land use, and proximity to urban areas. Manual assessment is time-consuming and prone to error.

**Our goal:** Build a geospatial decision support tool that helps government agencies, renewable energy planners, and private investors identify optimal solar farm locations through data-driven suitability mapping.

---

## 💡 What is This Tool?

An interactive Google Earth Engine web application that analyses multiple spatial datasets and generates a **weighted suitability map** for solar farm placement across Sindh and Balochistan. All weights are adjustable by the user in real time.

---

## 👥 Target Users

- Government agencies & renewable energy ministries
- Private solar energy investors & developers
- Urban and regional planners
- Environmental researchers

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| ☀️ Solar Radiation Analysis | Identifies high-radiation zones using MODIS satellite data |
| 🏔️ Terrain & Elevation Evaluation | Analyses slope and elevation using NASA NASADEM |
| 🗺️ Land Use Filtering | Automatically excludes urban areas, water bodies, croplands, tree cover, and mangroves |
| 🏙️ City Buffer Zones | Configurable exclusion zone around cities (min 10 km, max 200 km) |
| ⚖️ Adjustable Weights | User-controlled weights for solar radiation, land use, and elevation |
| 🔴 Unsuitable Area Display | Optional overlay showing excluded/unsuitable land |
| 🟢 Suitability Map | Colour-coded weighted overlay map generated on demand |

---

## 🗃️ Data Sources

| Dataset | Source | Purpose |
|---------|--------|---------|
| MODIS MCD18A1 | NASA MODIS | Solar radiation data |
| NASA NASADEM HGT 001 | NASA | Elevation and terrain analysis |
| ESA WorldCover 10m v100 | European Space Agency | Land use and land cover classification |
| Large Scale International Boundary | World Boundaries Data | Pakistan / region boundaries |

---

## 🎨 Suitability Classes

| Colour | Score Range | Class |
|--------|-------------|-------|
| 🔴 Red | 0.0 – 0.2 | Unsuitable |
| 🟠 Orange | 0.2 – 0.4 | Low Potential |
| 🟡 Yellow | 0.4 – 0.6 | Moderate Potential |
| 🟢 Light Green | 0.6 – 0.8 | High Potential |
| 🟩 Dark Green | 0.8 – 1.0 | Excellent Potential |

---

## 🧠 How It Works

```
Pakistan Boundaries ──► Clip to ROI
ESA Land Cover      ──► Clip to ROI ──► Reclassify ──► Keep Bare/Sparse/Grassland
                                    └──► Negate Urban/Tree/Water ──► Land Use Score
                                                                          ↓
MODIS Solar Radiation ─► Clip to ROI ──► Reclassify ──► Solar Radiation Mask
                                                               ↓
NASA Elevation ────────► Clip to ROI ──► Reclassify ──► Elevation Layer
                                                               ↓
City Points ───────────► Buffer ──► Create Buffer (Min 10km, Max 200km)
                                        ──► Union + Difference ──► Buffer Zone ──► Buffer Mask
                                                                          ↓
                              Normalize all layers to [0, 1]
                                          ↓
                        Weighted Overlay (weights set by user)
                                          ↓
                                   Suitability Map
```

---

## 🗺️ Normalisation Ranges

| Layer | Raw Range | Normalised To |
|-------|-----------|---------------|
| Land Use Score | -4 to 2 | 0 to 1 |
| Elevation | 0 to 1500 m | 0 to 1 |
| Solar Radiation | 200 to 800 W/m² | 0 to 1 |

---

## 🔧 User Controls (in the App Panel)

- **City Buffer Minimum (km)** — slider to set minimum exclusion distance from cities
- **City Buffer Maximum (km)** — slider to set maximum exclusion distance from cities
- **Minimum Solar Radiation (W/m²)** — filter out areas below this threshold
- **Maximum Solar Radiation (W/m²)** — filter out areas above this threshold
- **Show Solar Radiation Layer** — toggle to display/hide the raw solar layer
- **Display Unsuitable Radiation** — toggle to show areas that fail the radiation filter
- **Weight for Solar Radiation** — adjustable weight (must sum to 1 with other weights)
- **Weight for Land Use** — adjustable weight
- **Weight for Elevation** — adjustable weight
- **Generate Suitability Map** button — runs the weighted overlay and renders the result

> 💡 Tip: Make sure your three weights add up to 1.0 before generating the map.

---

## 📂 Repository Contents

| File | Description |
|------|-------------|
| `Gis_Project_Script.js` | Full Google Earth Engine JavaScript source code |
| `Gis_Project_Presentation.pdf` | Project proposal and presentation with flowchart and screenshots |
| `GIS_Deployed_URL.txt` | Direct link to the deployed web application |

---

## ⚙️ Requirements

- Modern web browser (Google Chrome or Mozilla Firefox recommended)
- Stable internet connection
- No installation required — runs entirely in the browser via Google Earth Engine

---

## 🔄 Processing Pipeline Summary

The tool performs the following steps automatically when you click **Generate Suitability Map**:

1. Clips all datasets to the Sindh & Balochistan region of interest (ROI)
2. Reclassifies ESA land cover — keeping bare/sparse/grassland, penalising urban/water/crop/tree areas
3. Reclassifies NASA elevation data and normalises it
4. Creates a solar radiation mask based on user-defined min/max thresholds
5. Builds city exclusion buffer zones using vector overlay operations
6. Normalises all three layers to a [0, 1] scale
7. Applies user-defined weights and computes the weighted overlay
8. Renders the final colour-coded suitability map on screen

---

## 🚧 Limitations

- Results are based on available satellite data resolution and may not reflect ground-level conditions
- City buffer zones are based on point data and may not account for all built-up areas
- The tool is currently scoped to Sindh and Balochistan only

---
