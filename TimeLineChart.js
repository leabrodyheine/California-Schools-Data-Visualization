/**
 * Aggregates enrollment data by learning method for each year and month.
 * It creates a structure to hold total enrollment and enrollment by learning method
 * for each distinct year-month combination in the dataset.
 * @param {Array} data - An array of objects where each object represents enrollment data,
 * including the time period start date, total enrollment, and learning model.
 * @returns {Object} An object where each key is a year-month string (YYYY-MM) and its value
 * is an object containing total enrollment and a breakdown of enrollment by learning method.
 */
function aggregateEnrollmentByMethod_timeline(data) {
  d3.select("#timeline-div").selectAll("*").remove();

  const aggregation = {};

  data.forEach((item) => {
    const date = new Date(item.TimePeriodStart);
    const yearMonthKey = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, '0');

    if (!aggregation[yearMonthKey]) {
      aggregation[yearMonthKey] = { total: 0, methods: {} };
    }
    const monthEntry = aggregation[yearMonthKey];
    const enrollment = parseInt(item.EnrollmentTotal, 10);
    monthEntry.total += isNaN(enrollment) ? 0 : enrollment;

    const learningMethod = item.LearningModel;
    if (!monthEntry.methods[learningMethod]) {
      monthEntry.methods[learningMethod] = 0;
    }
    monthEntry.methods[learningMethod] += isNaN(enrollment) ? 0 : enrollment;
  });

  return aggregation;
}



/**
 * Renders a timeline visualization based on aggregated enrollment data.
 * This function aggregates data by learning method and date, then uses D3 to create a timeline
 * chart showing the changes in enrollment by method over time. It sets up the SVG canvas,
 * defines scales and axes, and draws the timeline with data points and a legend.
 * @param {Array} data - An array of objects where each object represents enrollment data,
 * including the time period start date, total enrollment, and learning model.
 */
async function renderTimeLine(data) {
  const aggregatedData = aggregateEnrollmentByMethod_timeline(data);

  let plotData = [];
  Object.keys(aggregatedData).forEach(yearMonthKey => {
    Object.entries(aggregatedData[yearMonthKey].methods).forEach(([method, value]) => {
      plotData.push({
        date: new Date(yearMonthKey + "-01"),
        method,
        value
      });
    });
  });

  // Ensure plotData is sorted - might be redundant if your data is already chronological
  plotData.sort((a, b) => a.date - b.date);

  // Debugging: Log to see if plotData looks correct
  console.log(plotData);


  const margin = { top: 20, right: 20, bottom: 60, left: 60 },
    width = 800 - margin.left - margin.right,
    height = 375 - margin.top - margin.bottom;

  const svg = d3.select("#timeline-div")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .classed("svg-content-responsive", true)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set up scales
  const xScale = d3.scaleTime()
    .domain(d3.extent(plotData, d => d.date))
    .range([0, width]);

  // Adjust yScale domain to account for millions
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(plotData, d => d.value) / 1e6])
    .range([height, 0]);

  // Format Y Axis to show labels in millions and add "M" for million
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d => `${d}M`);

  // Define color scale
  const color = d3.scaleOrdinal(d3.schemeGnBu[4])
    .domain(plotData.map(d => d.method));

  // Add X Axis with a proper date format
  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.timeFormat("%b"));

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis)
    .style("color", "#cccccc");

  // Add Y Axis
  svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis)
    .style("color", "#cccccc");

  // Add horizontal grid lines
  svg.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(yScale)
      .tickSize(-width)
      .tickFormat(""))
    .style("stroke", "#4F4F4F")
    .selectAll("line")
    .style("stroke", "#4F4F4F");

  // For X-axis text
  svg.select(".x-axis")
    .selectAll("text")
    .style("fill", "#cccccc");

  // For Y-axis text
  svg.select(".y-axis")
    .selectAll("text")
    .style("fill", "#cccccc");

  // Append x-axis label
  svg.append("text")
    .style("text-anchor", "middle")
    .attr("y", 335)
    .attr("x", width / 2 - 10)
    .text("Months")
    .style("font-size", "13px")
    .style("fill", "#cccccc");

  // Append y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -height / 2)
    .attr("dy", "1em")
    .style("font-size", "13px")
    .style("text-anchor", "middle")
    .text("Total Enrollment in Millions")
    .style("fill", "#cccccc");

  // Define line generator
  const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value / 1e6));

  // Separate data by learning method
  const learningMethods = [...new Set(plotData.map(d => d.method))];
  const dataByMethod = learningMethods.map(method => ({
    method,
    values: plotData.filter(d => d.method === method).sort((a, b) => a.date - b.date)
  }));

  // Append defs and add filter for glow effect
  const defs = svg.append("defs");

  const filter = defs.append("filter")
    .attr("id", "glow");

  filter.append("feGaussianBlur")
    .attr("stdDeviation", "5")
    .attr("result", "coloredBlur");

  const feMerge = filter.append("feMerge");
  feMerge.append("feMergeNode")
    .attr("in", "coloredBlur");
  feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");


  // Tooltip
  const tooltip = d3.select("body").append("div")
    .attr("id", "tooltip-timeline")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ddd")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("color", "#000")
    .style("pointer-events", "none");


  // Add lines
  dataByMethod.forEach(methodData => {
    methodData.values.sort((a, b) => a.date - b.date);
    console.log(methodData)
    svg.append("path")
      .datum(methodData.values)
      .attr("data-model", methodData.method)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", color(methodData.method))
      .attr("stroke-width", 4)
      .attr("d", line)
      .style("filter", "url(#glow)")
      .on("mousemove", function (event, d) {
        const mouseX = d3.pointer(event, this)[0];
        const mouseDate = xScale.invert(mouseX);
        const bisector = d3.bisector(d => d.date).left;
        let idx = bisector(methodData.values, mouseDate, 1);
        let closestData = methodData.values[idx];
        if (idx > 0) {
          const d0 = methodData.values[idx - 1];
          const d1 = methodData.values[idx];
          closestData = mouseDate - d0.date > d1.date - mouseDate ? d1 : d0;
        }
        const valueInMillions = (closestData.value / 1e6).toFixed(1);
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY + 10) + "px")
          .html("Enrollment total: " + `<strong>${valueInMillions}M</strong>`
            + "<br>Learning Model: " + `<strong>${methodData.method}</strong>`
            + "<br>Month: " + `<strong>${closestData.date.toLocaleString('default', { month: 'long', year: 'numeric' })}</strong>`)
          .style("opacity", 1);
      })
      .on("mouseleave", function () {
        tooltip.style("opacity", 0);
      });
    console.log("making lines")
  });

  // Calculate legend size based on number of items
  const legendItemHeight = 20;
  const legendPadding = 5;
  const legendHeight = learningMethods.length * legendItemHeight + (2 * legendPadding);
  const legendWidth = 150;


  // Add legend
  svg.append("rect")
    .attr("class", "legend-background")
    .attr("x", width - legendWidth)
    .attr("y", 0 - legendPadding)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .attr("fill", "#cccccc");

  const legend = svg.selectAll(".legend")
    .data(learningMethods)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(0,${i * legendItemHeight})`)
    .style("fill", "#cccccc");

  legend.append("rect")
    .attr("x", width - 18 - 30)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", d => color(d));

  legend.append("text")
    .attr("x", width - 24 - 30)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("fill", "#4F4F4F")
    .style("text-anchor", "end")
    .text(d => d);
}

window.renderTimeLine = renderTimeLine;
