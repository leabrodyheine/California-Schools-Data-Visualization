
let globalData;
let filteredData = [];

/**
 * Filters the given data array based on the specified year and month.
 * @param {Array} data - The array of data to be filtered.
 * @param {(string|number)} year - The year to filter the data by.
 * @param {(string|number)} month - The month to filter the data by, where 1 = January, 2 = February, etc.
 * @returns {Array} An array of data entries that match the specified year and month.
 */
function filterData(data, year, month) {
  year = parseInt(year, 10);
  month = parseInt(month, 10);

  // Check data before proceeding
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid or empty data array passed to filterData.");
    return [];
  }

  // Filter data
  const filtered = data.filter(d => {
    const date = new Date(d.TimePeriodStart);
    return (date.getMonth() + 1) === month && date.getFullYear() === year
  });

  return filtered;
}


/**
 * Sets up event listeners for filtering operations based on time periods.
 * @param {Array} data - The array of data to apply the filter on.
 * @param {Array} uniqueTimePeriods - An array of unique time periods in the format "YYYY-MM" to be used for the slider.
 */
function setupFilterListeners(data, uniqueTimePeriods) {
  const slider = document.getElementById('time-slider');

  slider.addEventListener('input', function (e) {
    const index = e.target.value;
    let selectedYearMonth = uniqueTimePeriods[index];
    const [year, month] = selectedYearMonth.split('-').map(Number);
    selectedYearMonth = `${parseInt(month)}-${year}`; // Converts "2021-06" to "6-2021"
    console.log("selected year", selectedYearMonth)
    console.log("filter event listner")
    filteredData = filterData(globalData, year, month);
    let forDateLable = `${parseInt(year)}-${month}`
    updateSliderDateLabel(forDateLable);
    updateMapForMonthYear(selectedYearMonth, data);
  });
  updateSliderDateLabel(uniqueTimePeriods[slider.value]);
}



/**
 * Updates the label of the slider to display the selected month and year.
 * @param {string} monthYear - The selected month and year in the format "YYYY-MM".
 */
function updateSliderDateLabel(monthYear) {
  console.log("for label: ", monthYear)
  const [year, month] = monthYear.split('-');
  const date = new Date(year, month - 1);
  const formattedDate = date.toLocaleString('default', { month: 'long', year: 'numeric' });
  document.getElementById('slider-date-label').textContent = formattedDate;
}



/**
 * Triggers updates for map visualization based on the selected month and year.
 * @param {string} yearMonth - The year and month in the format "YYYY-MM" for which to update the map.
 * @param {Array} data - The data to be used for updating the map.
 */
function updateMapForMonthYear(yearMonth, data) {
  // Split currentMonthYear to adjust format to "Month-Year"
  const [year, month] = yearMonth.split("-");

  if (currentMonthYear == "" || currentMonthYear == null) {
    currentMonthYear = `${parseInt(month)}-${year}`;
    console.log("here")
  }
  else {
    currentMonthYear = `${parseInt(year)}-${month}`;
    console.log("HERE")
  }

  if (filteredData) {
    renderMapboxMap(filteredData);
    renderBubbleChart(filteredData);
    renderBarChart(filteredData);
    renderHeatMap(filteredData);
  } else {
    console.error("Filtered data is undefined, cannot render map or bubble chart.");
  }
}



/**
 * Performs the initial loading of map data and setups the time slider.
 * @param {Array} data - The array of data to be used for initializing the map.
 */
async function initialMapLoad(data) {
  const timePeriods = data.map(d => `${d.TimePeriodStart.getFullYear()}-${(d.TimePeriodStart.getMonth() + 1).toString().padStart(2, '0')}`);
  const uniqueTimePeriods = [...new Set(timePeriods)].sort();

  const timeSlider = document.getElementById('time-slider');
  timeSlider.min = 0;
  timeSlider.max = uniqueTimePeriods.length - 1;
  timeSlider.value = uniqueTimePeriods.length - 1;

  // Parse most recent month and year from slider's initial value.
  const mostRecentYearMonth = uniqueTimePeriods[uniqueTimePeriods.length - 1];
  const [year, month] = mostRecentYearMonth.split('-').map(Number);
  filteredData = filterData(globalData, year, month);

  setupFilterListeners(filteredData, uniqueTimePeriods)
  updateMapForMonthYear(mostRecentYearMonth, filteredData);
}


/**
 * Filters the given data based on the selected school type.
 * @param {Array} data - The array of data to be filtered.
 * @param {string} schoolType - The school type to filter by.
 * @returns {Array} The filtered array of data.
 */
function filterDataBySchoolType(data, schoolType) {
  if (schoolType === "All") {
    return data;
  }
  return data.filter(d => d.SchoolType === schoolType);
}



/**
 * Filters the given data based on the selected learning model.
 * @param {Array} data - The array of data to be filtered.
 * @param {string} learningModel - The learning model to filter by.
 * @returns {Array} The filtered array of data.
 */
function filterDataByLearningModel(data, learningModel) {
  if (learningModel === "All") {
    return data;
  }
  return data.filter(d => d.LearningModel === learningModel);
}



/**
 * Filters the given data based on enrollment size range.
 * @param {Array} data - The array of data to be filtered.
 * @param {(string|number)} minEnrollment - The minimum enrollment size for the filter.
 * @param {(string|number)} maxEnrollment - The maximum enrollment size for the filter.
 * @returns {Array} The filtered array of data.
 */
function filterDataByEnrollmentRange(data, minEnrollment, maxEnrollment) {
  if (minEnrollment === 'All') {
    return data;
  }
  return data.filter(item => {
    const enrollmentTotal = item.EnrollmentTotal;
    return enrollmentTotal >= minEnrollment && enrollmentTotal <= maxEnrollment;
  });
}




/**
 * Filters the given data based on the selected district.
 * @param {Array} data - The array of data to be filtered.
 * @param {string} district - The district name to filter by.
 * @returns {Array} The filtered array of data.
 */function filterDataByDistrict(data, district) {
  if (district === "All") {
    return data;
  }
  return data.filter(d => d.DistrictName === district);
}



/**
 * Populates the district dropdown with options based on the given data.
 * @param {Array} data - The array of data used to extract unique district names for the dropdown.
 */
function populateDistrictDropdown(data) {
  const districtSelector = document.getElementById('district-selector');
  const uniqueDistricts = Array.from(new Set(data.map(item => item.DistrictName))).sort();

  // Clear existing options
  districtSelector.innerHTML = '<option value="All">All Districts</option>';

  // Add districts to the dropdown
  uniqueDistricts.forEach(district => {
    const option = document.createElement('option');
    option.value = district;
    option.textContent = district;
    districtSelector.appendChild(option);
  });
}

window.onload = async () => {
  globalData = await loadData();
  populateDistrictDropdown(globalData);
  initialMapLoad(globalData);
  renderBarChart(globalData);
  renderTimeLine(globalData);
  renderHeatMap(globalData);


  //Event listener for school type dropdown
  document.getElementById('school-type-selector').addEventListener('change', (event) => {
    let selectedSchoolType = event.target.value;

    // Filter globalData based on selected school type
    let filteredBySchoolTypeData = filterDataBySchoolType(globalData, selectedSchoolType);

    renderBarChart(filteredBySchoolTypeData);
    renderBubbleChart(filteredBySchoolTypeData);
    renderMapboxMap(filteredBySchoolTypeData);
    renderTimeLine(filteredBySchoolTypeData);

    console.log(`Data filtered for school type: ${selectedSchoolType}`);
  });

  //Event listener for learning model dropdown
  document.getElementById('learning-model-selector').addEventListener('change', (event) => {
    let selectedLearningModel = event.target.value;

    // Filter globalData based on selected learning model
    let filteredByLearningModelData = filterDataByLearningModel(globalData, selectedLearningModel);

    // Update visualizations with filtered data
    renderBarChart(filteredByLearningModelData);
    renderBubbleChart(filteredByLearningModelData);
    renderTimeLine(filteredByLearningModelData);
    renderHeatMap(filteredByLearningModelData);

    console.log(`Data filtered for learning model: ${selectedLearningModel}`);
  });

  // Event listner for enrollment size
  document.getElementById('enrollment-range-selector').addEventListener('change', function (event) {
    let filteredData;

    if (event.target.value === "All") {
      filteredData = globalData;
    } else {
      const [minEnrollment, maxEnrollment] = event.target.value.split('-').map(Number);
      filteredDataSize = filterDataByEnrollmentRange(globalData, minEnrollment, maxEnrollment);
    }

    renderBarChart(filteredDataSize);
    renderBubbleChart(filteredDataSize);
    renderTimeLine(filteredDataSize);
    renderHeatMap(filteredDataSize);
  });

  //Event listener for district dropdown
  document.getElementById('district-selector').addEventListener('change', (event) => {
    let selectedDistrict = event.target.value;

    // Filter globalData based on selected learning model
    let filteredByDistrictData = filterDataByDistrict(globalData, selectedDistrict);

    // Update visualizations with filtered data
    renderBarChart(filteredByDistrictData);
    renderBubbleChart(filteredByDistrictData);
    renderHeatMap(filteredByDistrictData);

    console.log(`Data filtered for learning model: ${selectedDistrict}`);
  });

  // Clicking out of highlighted learning model
  document.addEventListener('click', function () {
    d3.select("#heatmap-div").selectAll("rect").style('opacity', 1);
    d3.select("#bar-graph-div").selectAll("rect").style('opacity', 1);
    d3.select("#timeline-div").selectAll("path").style('opacity', 1);
    d3.select("#bubble-chart").selectAll(".bubble").style('opacity', 1);
  });
};
