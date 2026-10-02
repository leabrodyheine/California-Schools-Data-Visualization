# California Schools Learning-Model Dashboard

A completed browser-based data-visualization project exploring the learning models used by California schools during the COVID-19 pandemic. The dashboard combines timeline, bar, bubble, heat-map, and geographic views so users can compare patterns by date, school type, enrollment, and district.

## Features

- Coordinated filters across multiple interactive charts
- D3 and Plotly visualizations
- A Mapbox district map backed by GeoJSON
- Views of learning-model changes over time and across school characteristics

## Run locally

1. Extract `Data.zip` in the repository root. It contains `California_Schools_LearningModelData_Final.csv` and `California_School_District_Areas_2020-21.geojson`.
2. Serve the repository with a local web server; browser security rules prevent the data files from loading reliably through a direct `file://` URL.
3. Open `Index.html` through that server.

For example, with Python installed:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/Index.html>.

The dashboard loads D3, Plotly, and Mapbox resources from the internet. A recorded walkthrough is included in `CS5044 P2 Video.mov.zip`, and data/image attribution is recorded in `sources.txt`.

## Project status

This is a completed academic visualization project. The source, packaged data, and walkthrough are preserved together for reproducibility.
