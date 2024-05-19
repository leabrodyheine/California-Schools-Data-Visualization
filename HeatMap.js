/**
 * Renders a heatmap visualization inside a specified DOM element. This function processes the given
 * data to aggregate counts by school type and learning model, then creates a heatmap using D3.js.
 * It also configures and displays axes, scales, and a color legend to help interpret the heatmap.
 * Tooltips are added to display specific count information on mouseover for each cell.
 * 
 * @param {Array} data - An array of objects, where each object contains properties for SchoolType, LearningModel, and other data.
 */
function renderHeatMap(data) {
  d3.select("#heatmap-div").selectAll("*").remove();

  const margin = { top: 20, right: 30, bottom: 30, left: 60 },
    width = 700 - margin.left - margin.right,
    height = 345 - margin.top - margin.bottom;

  const svg = d3.select("#heatmap-div")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const rollupData = d3.rollup(data, v => v.length, d => d.SchoolType, d => d.LearningModel);
  let heatmapData = [];
  rollupData.forEach((value, key) => {
    value.forEach((count, LearningModel) => {
      heatmapData.push({ SchoolType: key, LearningModel, Count: count });
    });
  });

  // Scales
  const x = d3.scaleBand().range([0, width]).domain(heatmapData.map(d => d.SchoolType)).padding(0.01);
  const y = d3.scaleBand().range([height, 0]).domain(heatmapData.map(d => d.LearningModel)).padding(0.01);
  const myColor = d3.scaleSequential().interpolator(d3.interpolateGnBu).domain([0, d3.max(heatmapData, d => d.Count)]);

  // Axes
  svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x));
  svg.append("g").call(d3.axisLeft(y));

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ddd")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("color", "#000")
    .style("pointer-events", "none");

  const mouseover = function (event, d) {
    tooltip.style("opacity", 1);
    d3.select(this).style("stroke", "black").style("stroke-width", 2);
  };

  const mousemove = function (event, d) {
    const [x, y] = d3.pointer(event, this);
    tooltip
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY + 10) + "px")
      .html("Number of Schools: " + `<strong>${d.Count}</strong>` + "<br>Learning Model: " + `<strong>${d.LearningModel}</strong>`)
      .style("opacity", 1);
  };

  const mouseleave = function (event, d) {
    tooltip.style("opacity", 0);
    d3.select(this).style("stroke", null).style("stroke-width", 0);
  };

  // Draw squares
  svg.selectAll().data(heatmapData, d => `${d.SchoolType}:${d.LearningModel}`)
    .enter()
    .append("rect")
    .attr("x", d => x(d.SchoolType))
    .attr("y", d => y(d.LearningModel))
    .attr("width", x.bandwidth())
    .attr("data-model", d => d.LearningModel)
    .attr("height", y.bandwidth())
    .style("fill", d => myColor(d.Count))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  // Add text
  svg.selectAll()
    .data(heatmapData, d => `${d.SchoolType}:${d.LearningModel}`)
    .enter()
    .append("text")
    .text(d => d.Count)
    .attr("x", d => x(d.SchoolType) + x.bandwidth() / 2)
    .attr("y", d => y(d.LearningModel) + y.bandwidth() / 2 + 5)
    .style("text-anchor", "middle")
    .style("fill", "#272727");

  createHeatMapLegend(myColor, height, svg);
}


/**
 * Creates a legend for the heatmap. The legend visually represents the range of values
 * in the heatmap through a color gradient, helping to interpret the colors of the heatmap squares.
 * The legend is drawn using D3.js within the same SVG element as the heatmap.
 *
 * @param {d3.scaleSequential} myColor - A D3 scaleSequential color scale used to color the heatmap.
 * This function uses the color scale to create a corresponding legend.
 * @param {number} height - The height of the main heatmap SVG element. Used to position the legend appropriately.
 * @param {d3.Selection} svg - The D3 selection of the SVG element in which to render the legend.
 */
function createHeatMapLegend(myColor, height, svg) {
  const legendWidth = 300, legendHeight = 20, legendPosition = { x: 0, y: height + 50 };

  const legendColorScale = d3.scaleLinear()
    .domain(myColor.domain())
    .range([0, legendWidth]);

  const legend = svg.append("g")
    .attr("transform", `translate(${legendPosition.x}, ${legendPosition.y})`);

  svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .selectAll("stop")
    .data(myColor.ticks().map((t, i, n) => ({ offset: `${100 * i / n.length}%`, color: myColor(t) })))
    .join("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);

  legend.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#gradient)");

  legend.append("g")
    .call(d3.axisBottom(legendColorScale).ticks(5).tickSize(-legendHeight))
    .attr("transform", `translate(0, ${legendHeight})`);
}

window.renderHeatMap = renderHeatMap;
