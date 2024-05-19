# California-Schools-Data-Visualization

## Project Overview
This project provides a comprehensive visualization of learning models adopted by schools in California during a specific period. Utilizing datasets that include enrollment numbers, learning models, and school types, it generates interactive visualizations including a timeline chart, bar chart, bubble chart, heatmap, and geographic map representation. The goal is to explore how different learning models were distributed across school types, sizes, and districts during the pandemic.

## Features
- **Dynamic Data Loading**: Asynchronously loads and cleans data from a specified CSV file.
- **Interactive Visualizations**: Includes multiple D3.js and Mapbox based visualizations that dynamically update based on user-selected filters.
- **User Interaction**: Allows users to filter visualizations based on time periods, school types, learning models, enrollment sizes, and districts.

## Setup
To run this project locally, follow these steps:
1. Use the Chrome web browser.
2. Unzip the provided data file `California_Schools_LearningModelData_Final.zip` into the project directory.
3. Open `index.html` in a live preview to interact with the webpage.

## Dependencies
- D3.js (v7)
- Mapbox GL JS (v2.3.1)
- Plotly.js (Latest)

## Project Structure
- **index.html**: The entry point of the project, containing the layout and references to JavaScript and CSS files.
- **styleSheet.css**: Contains styles for the webpage.
- **main.js**: Initializes the visualizations and sets up event listeners for interactive elements.
- **dataLoader.js**: Asynchronously loads and processes the CSV data file.
- **visualizations**:
  - **barChart.js**: Generates the bar chart visualization.
  - **bubbleChart.js**: Generates the bubble chart visualization.
  - **heatMap.js**: Generates the heatmap visualization.
  - **mapVisualization.js**: Generates the geographic map visualization.
  - **timeLineChart.js**: Generates the timeline chart visualization.
    
## Video Walkthrough
A zip file (`CS5044_P2_Video.mov.zip`) is provided that contains a video walkthrough of the dashboard. Unzip this file and watch the video to understand how to navigate and interact with the visualizations.

## Data Source
The data used in this project is stored in `California_Schools_LearningModelData_Final.csv`. It includes details on school types, enrollment numbers, and learning models adopted by schools across various districts in California.

**Note**: The data file is provided in a zip format due to its size. Please unzip the file into the project directory to run the dashboard.

## Running the Project
To run the project, unzip the data file, open `index.html` in your Chrome browser, and interact with the visualizations.
