/**
 * Renders a bubble chart to visualize the distribution of enrollment across different learning models.
 * This function processes filtered data to calculate the total enrollment and the percentage of enrollment
 * for each learning model. Bubbles of varying sizes represent the enrollment numbers, and their placement
 * in the chart is determined through a force simulation. Interactivity is added through click events that
 * highlight the selected learning model across other visualizations like heatmaps, bar graphs, and timelines.
 *
 * @param {Array} filteredData - An array of data objects filtered by certain criteria. Each object must contain
 * properties for EnrollmentTotal and LearningModel.
 */
function renderBubbleChart(filteredData) {
    const container = d3.select("#bubble-chart");
    container.html("");

    var margin = { top: 10, right: 30, bottom: 10, left: 55 },
        width = 550 - margin.left - margin.right,
        height = 360 - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    const totalEnrollment = d3.sum(filteredData, d => d.EnrollmentTotal);

    const aggregatedData = d3.rollups(filteredData,
        v => d3.sum(v, d => d.EnrollmentTotal),
        d => d.LearningModel)
        .map(d => ({
            model: d[0],
            count: d[1],
            percent: ((d[1] / totalEnrollment) * 100).toFixed(2)
        }));


    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(aggregatedData, d => d.count)])
        .range([25, 80]);

    // Define filter
    const defs = svg.append("defs");
    const filter = defs.append("filter")
        .attr("id", "glow");
    filter.append("feGaussianBlur")
        .attr("stdDeviation", "3.5")
        .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
        .attr("in", "coloredBlur");
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");

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
            .html("Percent of Students: " + `<strong>${d.percent}%</strong>` + "<br>Learning Model: " + `<strong>${d.model}</strong>`)
            .style("opacity", 1);
    };

    const mouseleave = function (event, d) {
        tooltip.style("opacity", 0);
        d3.select(this).style("stroke", null).style("stroke-width", 0);
    };


    const simulation = d3.forceSimulation(aggregatedData)
        .force("x", d3.forceX(width / 2).strength(1))
        .force("y", d3.forceY(height / 2).strength(1))
        .force("charge", d3.forceManyBody().strength(-10))
        .force("collide", d3.forceCollide(d => radiusScale(d.count) + 2))
        .on("tick", ticked);

    function ticked() {
        const bubble = svg.selectAll(".bubble")
            .data(aggregatedData)
            .join("g")
            .attr("class", "bubble")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        const circles = bubble.selectAll("circle")
            .data(d => [d])
            .join("circle")
            .attr("r", d => radiusScale(d.count))
            .attr("fill", d => learningModelColors[d.model])
            .style("filter", "url(#glow)")
            .on('click', function (event, d) {
                event.stopPropagation();
                highlightLearningModel(d.model)
            })
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

        bubble.append("text")
            .text(d => d.model)
            .style("text-anchor", "middle")
            .attr("dy", "-0.5em")
            .attr("font-size", "13px")
            .style("letter-spacing", "1px")
            .style("fill", "#272727");

        bubble.append("text")
            .text(d => `${d.percent}%`)
            .style("text-anchor", "middle")
            .attr("dy", "1em")
            .attr("font-size", "13px")
            .style("fill", "#272727")
            .style("letter-spacing", "1.5px");
    }
    simulation.alpha(1).restart();


    /**
     * Highlights elements across different visualizations based on the selected learning model.
     * This is an internal function within `renderBubbleChart` and is called upon clicking a bubble.
     * It adjusts the opacity of elements in the bubble chart, heatmap, bar graph, and timeline
     * to visually emphasize data related to the selected learning model.
     *
     * @param {string} selectedModel - The learning model selected by the user, used to filter and highlight
     * data across all visualizations.
     * @private
     */
    function highlightLearningModel(selectedModel) {
        console.log("Selected model:", selectedModel);

        // Logic to highlight selected model in bubble chart
        svg.selectAll('.bubble')
            .each(function (d) { console.log(d); })
            .style('opacity', d => {
                return d.model === selectedModel ? 1 : 0.2;
            });

        // Heatmap highlighting logic
        d3.select("#heatmap-div").selectAll("rect")
            .style('opacity', function () {
                const model = d3.select(this).attr("data-model");
                return model === selectedModel ? 1 : 0.2;
            });

        // Bar Graph highlighting logic
        d3.selectAll("#bar-graph-div rect")
            .style('opacity', function () {
                const model = d3.select(this).attr("data-model");
                return model === selectedModel ? 1 : 0.2;
            });

        // Timeline highlighting logic
        d3.select("#timeline-div").selectAll("path")
            .style('opacity', function () {
                const model = d3.select(this).attr("data-model");
                return model === selectedModel ? 1 : 0.2;
            });
    }
}
window.renderBubbleChart = renderBubbleChart;
