California Schools Data Visualization
=====================================

Project Overview
----------------
This project provides a comprehensive visualization of learning models adopted 
by schools in California during a specific period. Utilizing datasets that include 
enrollment numbers, learning models, and school types, it generates interactive 
visualizations including a timeline chart, bar chart, bubble chart, heatmap, and 
geographic map representation. The goal is to explore how different learning models 
were distributed across school types, sizes, and districts during the pandemic.

Features
--------
- Dynamic Data Loading: Asynchronously loads and cleans data from a specified CSV file.
- Interactive Visualizations: Includes multiple D3.js and Mapbox based visualizations 
    that dynamically update based on user-selected filters.
- User Interaction: Allows users to filter visualizations based on time periods, 
    school types, learning models, enrollment sizes, and districts.

Setup
-----
To run this project locally, follow these steps:
1. Use on Chrome web browser
3. Either use the link in our report or live preview to interact with the webpage

Dependencies
------------
- D3.js (v7)
- Mapbox GL JS (v2.3.1)
- Plotly.js (Latest)

Project Structure
-----------------
- Index.html: The entry point of the project, containing the layout and references 
    to JavaScript and CSS files.
- StyleSheet.css: Contains styles for the webpage.
- Main.js: Initializes the visualizations and sets up event listeners for interactive elements.
- DataLoader.js: Asynchronously loads and processes the CSV data file.
Visualizations:
  - BarChart.js: Generates the bar chart visualization.
  - BubbleChart.js: Generates the bubble chart visualization.
  - HeatMap.js: Generates the heatmap visualization.
  - MapVisualization.js: Generates the geographic map visualization.
  - TimeLineChart.js: Generates the timeline chart visualization.

Data Source
-----------
The data used in this project is stored in California_Schools_LearningModelData_Final.csv.
    It includes details on school types, enrollment numbers, and learning models 
    adopted by schools across various districts in California.