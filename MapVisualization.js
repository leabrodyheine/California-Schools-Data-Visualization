// Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoibGJoNSIsImEiOiJjbHU1bzBtc3IwdHljMmlueGc2aWQwamIxIn0.KFx5qzUkJz9ubiQ41wxYpg";

let map;
let colorScale;
let currentMonthYear;

/**
 * Calculates the percentage of virtual learning in each district for each month.
 * It aggregates total enrollment and virtual enrollment and computes the percentage
 * of virtual learning based on these aggregations.
 * @param {Array} data - The dataset containing enrollment information by district, month, and learning model.
 * @returns {Object} An object mapping district-month keys to their corresponding virtual learning percentage.
 */
function calculateVirtualLearningPercentage(data) {
  const enrollmentByDistrictAndMonth = {};

  data.forEach(row => {
    const districtName = row.DistrictName;
    const monthYear = `${row.TimePeriodStart.getMonth() + 1}-${row.TimePeriodStart.getFullYear()}`;
    const key = `${districtName}-${monthYear}`;

    if (!enrollmentByDistrictAndMonth[key]) {
      enrollmentByDistrictAndMonth[key] = { total: 0, virtual: 0 };
    }

    enrollmentByDistrictAndMonth[key].total += row.EnrollmentTotal;
    if (row.LearningModel === 'Virtual') {
      enrollmentByDistrictAndMonth[key].virtual += row.EnrollmentTotal;
    }
  });

  const percentageVirtual = {};
  Object.keys(enrollmentByDistrictAndMonth).forEach(key => {
    const { total, virtual } = enrollmentByDistrictAndMonth[key];
    if (total > 0) {
      percentageVirtual[key] = (virtual / total) * 100;
    }
  });
  return percentageVirtual;
}



/**
 * Renders a Mapbox map visualizing the percentage of virtual learning across districts.
 * It uses a color scale to represent different levels of virtual learning engagement.
 * @param {Array} data - The dataset containing enrollment information by district, month, and learning model.
 */
async function renderMapboxMap(data) {

  colorScale = d3.scaleSequential(d3.interpolateGnBu);
  const percentageVirtual = calculateVirtualLearningPercentage(data);

  // Initialize Mapbox map
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-120, 37.5],
    zoom: 4.3
  });


  // Function to set up map with data
  async function setupMapWithData() {
    colorScale = d3.scaleSequential(d3.interpolateGnBu).domain([0, 100]);

    const response = await fetch('data/California_School_District_Areas_2020-21.geojson');
    const geojsonData = await response.json();

    console.log("Current month and year:", currentMonthYear);
    geojsonData.features.forEach(feature => {
      const districtName = feature.properties.DistrictName;
      const key = `${districtName}-${currentMonthYear}`;
      feature.properties.percentageVirtual = percentageVirtual[key] || 0;
    });

    if (map.getSource('california-districts')) {
      map.getSource('california-districts').setData(geojsonData);
      console.log('Map data setup complete');

    } else {
      map.addSource('california-districts', {
        type: 'geojson',
        data: geojsonData
      });
      addDistrictLayer();
      console.log('Map data setup complete');
    }
  }

  // Function to add district layer to map
  function addDistrictLayer() {
    map.addLayer({
      id: 'districts-layer',
      type: 'fill',
      source: 'california-districts',
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'percentageVirtual'],
          0, colorScale(0),
          100, colorScale(100)
        ],
        'fill-opacity': 0.8
      }
    });
    createLegend();
  }

  if (map.isStyleLoaded()) {
    setupMapWithData();
  } else {
    map.on('load', setupMapWithData);
  }
}



/**
 * Creates a legend for the map to explain the color scale used to represent
 * the percentage of virtual learning. It dynamically generates legend entries
 * based on the defined color scale.
 */
function createLegend() {
  if (!colorScale) {
    console.error('colorScale is not defined');
    return;
  }

  const legendContainer = d3.select("#legend-map");
  legendContainer.selectAll(".legendEntry").remove();

  const legendData = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  legendData.forEach((value, index) => {
    const entry = legendContainer.append("div").attr("class", "legendEntry");

    entry.append("div")
      .style("background-color", colorScale(value))
      .attr("class", "legendColor");

    if (index < legendData.length - 1) {
      entry.append("span").text(`${value}%`);
    } else {
      entry.append("span").text(`${value}%`);
    }
  });
}
window.calculateVirtualLearningPercentage = calculateVirtualLearningPercentage;
window.renderMapboxMap = renderMapboxMap;
window.createLegend = createLegend;