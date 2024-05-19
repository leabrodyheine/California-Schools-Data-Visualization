const learningModelColors = {
    "Virtual": "#f0f9e7",
    "Hybrid": "#b9e4bc",
    "In-person": "#7bccc4",
    "Closed": "#2b8cbf"
};

/**
 * Calculates school size groups based on enrollment numbers. It creates fixed-size ranges
 * up to a maximum, plus a final category for any sizes above the largest fixed range.
 * @param {Array} data - An array of objects, each containing an `EnrollmentTotal` property.
 * @returns {Array} An array of size group objects, each with `min`, `max`, and `label` properties.
 */
function calculateSchoolSizeGroups(data) {
    const maxEnrollment = d3.max(data, d => d.EnrollmentTotal);

    const sizeGroups = [];
    for (let i = 0; i * 200 < 800; i++) {
        const min = i * 200;
        const max = (i + 1) * 200 - 1;
        const label = `${min}-${max}`;
        sizeGroups.push({ min, max, label });
    }

    const minLastCategory = 800;
    const maxLastCategory = maxEnrollment <= 999 ? maxEnrollment : 999;
    sizeGroups.push({ min: minLastCategory, max: maxLastCategory, label: `${minLastCategory}+` });

    return sizeGroups;
}


/**
 * Aggregates data by school size group and learning model. It filters the data into the
 * previously calculated size groups and counts the occurrences of each learning model within them.
 * @param {Array} data - The dataset to aggregate, containing `EnrollmentTotal` and `LearningModel` properties.
 * @param {Array} sizeGroups - An array of size group objects created by `calculateSchoolSizeGroups`.
 * @returns {Array} An array of objects, each representing the count of a learning model within a size group.
 */
function aggregateDataBySizeAndModel(data, sizeGroups) {
    const aggregatedData = [];

    sizeGroups.forEach(group => {
        const filteredData = data.filter(d => d.EnrollmentTotal >= group.min && d.EnrollmentTotal < group.max);

        const modelCounts = d3.rollup(filteredData, v => v.length, d => d.LearningModel);

        modelCounts.forEach((count, model) => {
            aggregatedData.push({
                sizeGroup: group.label,
                LearningModel: model,
                count: count
            });
        });
    });

    return aggregatedData;
}


/**
 * Renders a bar chart visualizing the distribution of schools across different size groups and learning models.
 * It utilizes D3.js for creating SVG elements and managing data bindings. The chart includes a legend for clarity.
 * @param {Array} originalData - The dataset to visualize, which includes properties for school size and learning model.
 */
function renderBarChart(originalData) {
    d3.select("#bar-graph-div").selectAll("*").remove();

    const sizeGroups = calculateSchoolSizeGroups(originalData);

    const aggregatedData = aggregateDataBySizeAndModel(originalData, sizeGroups);

    var subgroups = [...new Set(aggregatedData.map(d => d.LearningModel))];

    const transformedData = sizeGroups.map(sizeGroup => {
        const entry = { sizeGroup: sizeGroup.label };
        subgroups.forEach(subgroup => {
            const subgroupEntry = aggregatedData.find(d => d.sizeGroup === sizeGroup.label && d.LearningModel === subgroup);
            entry[subgroup] = subgroupEntry ? subgroupEntry.count : 0;
        });
        return entry;
    });

    var margin = { top: 30, right: 30, bottom: 47, left: 55 },
        width = 550 - margin.left - margin.right,
        height = 360 - margin.top - margin.bottom;

    var svg = d3.select("#bar-graph-div").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var groups = transformedData.map(d => d.sizeGroup);

    var x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0));

    var y = d3.scaleLinear()
        .domain([0, d3.max(transformedData, d => d3.sum(subgroups, subgroup => d[subgroup]))])
        .range([height, 0])
        .nice();
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y).tickFormat(d3.format("~s")));

    const defs = svg.append("defs");

    const filter = defs.append("filter")
        .attr("id", "glow");
    filter.append("feGaussianBlur")
        .attr("stdDeviation", 1.5)
        .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
        .attr("in", "coloredBlur");
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");

    var stackedData = d3.stack()
        .keys(subgroups)
        (transformedData);

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("id", "tooltip-bar")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "#000")
        .style("pointer-events", "none");


    svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter().append("g")
        .attr("fill", d => learningModelColors[d.key])
        .each(function (modelData) {
            d3.select(this).selectAll("rect")
                .data(modelData)
                .enter().append("rect")
                .attr("data-model", modelData.key)
                .attr("x", d => x(d.data.sizeGroup))
                .attr("y", d => y(d[1]))
                .attr("height", d => y(d[0]) - y(d[1]))
                .attr("width", x.bandwidth())
                .attr("filter", "url(#glow)")
                .on("mouseover", function (event, d) {
                    tooltip
                        .style("opacity", 1);
                    d3.select(this).style("stroke", "black").style("stroke-width", 2);
                })
                .on("mousemove", function (event, d) {
                    const [x, y] = d3.pointer(event, this);
                    tooltip
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY + 10) + "px")
                        .html(`Count: <strong>${d[1] - d[0]}</strong><br/>Model: <strong>${modelData.key}</strong>`)
                        .style("opacity", 1);
                })
                .on("mouseleave", function (event, d) {
                    tooltip
                        .style("opacity", 0);
                    d3.select(this).style("stroke", "none");
                });
        });

    const learningModels = ['Virtual', 'Hybrid', 'Closed', 'In-person'];

    createLegend_barChart(svg, learningModels, {
        posX: 120,
        posY: -20,
        itemWidth: 80,
        itemHeight: 15,
        rows: 1,
        padding: 4,
        backgroundColor: '#cccccc',
        backgroundOpacity: 1
    });

    svg.append("text")
        .style("text-anchor", "middle")
        .attr("y", 360)
        .attr("x", width / 2 - 10)
        .text("School Size")
        .style("font-size", "13px")
        .style("fill", "#cccccc");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -55)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .style("font-size", "13px")
        .style("text-anchor", "middle")
        .text("Num Schools")
        .style("fill", "#cccccc");

}


/**
 * Creates a legend for the bar chart, mapping learning models to colors for visual identification.
 * This helper function dynamically generates legend items based on provided parameters for positioning and styling.
 * @param {d3.Selection} svg - The SVG container for the bar chart where the legend will be appended.
 * @param {Array<string>} learningModels - An array of learning model identifiers to include in the legend.
 * @param {Object} options - An object specifying legend layout and styling options.
 */
function createLegend_barChart(svg, learningModels, options) {
    const {
        posX, posY, itemWidth, itemHeight, rows, padding, backgroundColor, backgroundOpacity
    } = options;

    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${posX}, ${posY})`);

    if (backgroundColor) {
        legend.append('rect')
            .attr('class', 'legend-background')
            .attr('x', -padding)
            .attr('y', -padding)
            .attr('width', itemWidth * (learningModels.length / rows) + padding * 2)
            .attr('height', itemHeight * rows + padding * 2)
            .attr('fill', backgroundColor);
    }

    learningModels.forEach((model, index) => {
        const column = index % (learningModels.length / rows);
        const row = Math.floor(index / (learningModels.length / rows));

        const legendItem = legend.append('g')
            .attr('transform', `translate(${column * itemWidth}, ${row * itemHeight})`);

        legendItem.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr("fill", d => learningModelColors[model])

        legendItem.append('text')
            .attr('x', 20)
            .attr('y', 12)
            .style("font-size", "10px")
            .text(model);
    });

    if (backgroundColor) {
        const bbox = legend.node().getBBox();
        legend.select('.legend-background')
            .attr('width', bbox.width + padding * 2)
            .attr('height', bbox.height + padding * 2);
    }
}

window.renderBarChart = renderBarChart;
