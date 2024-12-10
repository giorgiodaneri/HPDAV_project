import * as d3 from 'd3';

class Heatmap {
    margin = { top: 40, right: 50, bottom: 50, left: 85 };
    size;
    width;
    height;
    svg;
    heatmapGroup;

    constructor(container) {
        this.container = container;
        this.svg = d3.select(container).append("svg");
    }

    create({ size }) {
        this.size = size;
        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        this.svg
            .attr("width", this.size.width)
            .attr("height", this.size.height);

        this.heatmapGroup = this.svg.append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
    }

    clear() {
        this.heatmapGroup.selectAll("*").remove();
    }

    renderHeatmap(data, timeSlice, filter) {
        // Filter data for the specified time slice and desired classifications
        // const filteredData = data.filter(
        //     d => [1, 3, 4].includes(d.classification) && d.time === timeSlice
        // );

        // if filter is 1 then filter data for the classification 1,3,4, else do not filter
        const filteredData = filter === 1 ? data.filter(
            d => [1, 3, 4].includes(d.classification)) : data;

        // Step 1: Process the data
        // 1.1 Count occurrences of each sourceIP and destIP
        const sourceIPCounts = d3.rollup(filteredData, v => v.length, d => d.sourceIP);
        const destIPCounts = d3.rollup(filteredData, v => v.length, d => d.destIP);
    
        // 1.2 Get the top 20 sourceIP and destIP based on packet counts
        const topSourceIPs = Array.from(sourceIPCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30)
            .map(d => d[0]);
    
        const topDestIPs = Array.from(destIPCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30)
            .map(d => d[0]);
    
        // 1.3 Create a matrix for the heatmap (sourceIP x destIP)
        const matrix = [];
        for (let i = 0; i < topSourceIPs.length; i++) {
            for (let j = 0; j < topDestIPs.length; j++) {
                const sourceIP = topSourceIPs[i];
                const destIP = topDestIPs[j];
    
                // Filter rows corresponding to the current sourceIP and destIP
                const rows = filteredData.filter(d => d.sourceIP === sourceIP && d.destIP === destIP);
    
                // Aggregate the information
                const count = rows.length; // Number of packets
                const sourcePort = rows.length > 0 ? rows[0].sourcePort : 'N/A'; // Take first sourcePort
                const destPort = rows.length > 0 ? rows[0].destPort : 'N/A'; // Take first destPort
                const classification = rows.length > 0 ? rows[0].classification : 'N/A'; // Take first classification
    
                // Push the aggregated data into the matrix
                matrix.push({ sourceIP, destIP, count, sourcePort, destPort, classification, x: i, y: j });
            }
        }
    
        // Step 2: Set up the color scale with a logarithmic scale
        const maxCount = d3.max(matrix, d => d.count);
        const colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain([0, maxCount]);
    
        // Step 3: Create x and y scales for the heatmap
        const xScale = d3.scaleBand()
            .domain(topSourceIPs)
            .range([0, this.width])
            .padding(0.05);
    
        const yScale = d3.scaleBand()
            .domain(topDestIPs)
            .range([0, this.height])
            .padding(0.05);
    
        // Step 4: Create and configure the tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "rgba(0,0,0,0.7)")
            .style("color", "white")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("pointer-events", "none");
    
        // Map classification values to human-readable strings
        const classificationMap = {
            0: "Generic Protocol Command Decode",
            1: "Potential Corporate Privacy Violation",
            2: "Misc activity",
            3: "Attempted Information Leak",
            4: "Potentially Bad Traffic"
        };

        // Step 5: Draw the heatmap cells
        this.heatmapGroup.selectAll(".heatmap-cell")
        .data(matrix)
        .join("rect")
        .attr("class", "heatmap-cell")
        .attr("x", d => xScale(d.sourceIP))
        .attr("y", d => yScale(d.destIP))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.count))
        .on("mouseover", (event, d) => {
            // Show the tooltip on mouseover
            tooltip.style("visibility", "visible")
                .html(`
                    <strong>Source IP:</strong> ${d.sourceIP}<br>
                    <strong>Dest IP:</strong> ${d.destIP}<br>
                    <strong>Packets:</strong> ${d.count}<br>
                    <strong>Source Port:</strong> ${d.sourcePort}<br>
                    <strong>Dest Port:</strong> ${d.destPort}<br>
                    <strong>Classification:</strong> ${classificationMap[d.classification] || 'N/A'}
                `);
        })
        .on("mousemove", (event) => {
            // Position the tooltip near the mouse cursor
            tooltip.style("top", (event.pageY + 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", () => {
            // Hide the tooltip on mouseout
            tooltip.style("visibility", "hidden");
        });

        // remove the existing axes and axes labels and axes ticks
        this.heatmapGroup.selectAll(".axis").remove();
        this.heatmapGroup.selectAll(".axis-label").remove();
        this.heatmapGroup.selectAll(".tick").remove();

        // Step 6: Add axes
        this.heatmapGroup.append("g")
            .attr("transform", `translate(0, ${this.height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-45)");

        this.heatmapGroup.append("g")
            .call(d3.axisLeft(yScale));
    }
}

export default Heatmap;