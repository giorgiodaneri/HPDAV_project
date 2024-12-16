import * as d3 from 'd3';
import store from '../../store';
import { addSelectedCell } from '../../redux/HeatmapConfigSlice';

class Heatmap {
    margin = { top: 40, right: 50, bottom: 60, left: 85 };
    size;
    width;
    height;
    svg;
    heatmapGroup;

    constructor(container) {
        this.container = container;
        this.svg = d3.select(container).select("svg");
        if (this.svg.empty()) {
            this.svg = d3.select(container).append("svg");
        }
    }

    create({ size }) {
        this.size = size;
        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        this.svg
            .attr("width", this.size.width)
            .attr("height", this.size.height);

        this.heatmapGroup = this.svg.select("g");
        if (this.heatmapGroup.empty()) {
            this.heatmapGroup = this.svg.append("g")
                .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
        }
    }

    clear() {
        this.heatmapGroup.selectAll("*").remove();
    }

    parseTime(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') {
            console.warn("Invalid or missing time string:", timeStr);
            return 0;
        }

        const [day, time] = timeStr.split(" ");
        if (!time || !day) {
            console.warn("Invalid time format:", timeStr);
            return 0;
        }

        const [hours, minutes] = time.split(":").map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
            console.warn("Invalid time format (hours or minutes are NaN):", timeStr);
            return 0;
        }

        return day * 1440 + hours * 60 + minutes;
    }

    renderHeatmap(data, startTime, endTime, filters) {
        const parsedStartTime = this.parseTime(startTime);
        const parsedEndTime = this.parseTime(endTime);

        // remove all

        const filteredData = data.filter(d => {
            const time = this.parseTime(d.time);
            return time >= parsedStartTime && time <= parsedEndTime && filters.includes(d.classification);
        });

        const sourceIPCounts = d3.rollup(filteredData, v => v.length, d => d.sourceIP);
        const destIPCounts = d3.rollup(filteredData, v => v.length, d => d.destIP);

        const topSourceIPs = Array.from(sourceIPCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30)
            .map(d => d[0]);

        const topDestIPs = Array.from(destIPCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30)
            .map(d => d[0]);

        const matrix = [];
        for (let i = 0; i < topSourceIPs.length; i++) {
            for (let j = 0; j < topDestIPs.length; j++) {
                const sourceIP = topSourceIPs[i];
                const destIP = topDestIPs[j];

                const rows = filteredData.filter(d => d.sourceIP === sourceIP && d.destIP === destIP);

                const count = rows.length;
                const sourcePort = rows.length > 0 ? rows[0].sourcePort : 'N/A';
                const destPort = rows.length > 0 ? rows[0].destPort : 'N/A';
                const classification = rows.length > 0 ? rows[0].classification : 'N/A';

                matrix.push({ sourceIP, destIP, count, sourcePort, destPort, classification, x: i, y: j });
            }
        }

        if (matrix.length === 0) {
            this.heatmapGroup.selectAll("*").remove();

            const messageContainer = this.heatmapGroup.append("g")
                .attr("transform", `translate(${this.width / 2}, ${this.height / 2})`);

            messageContainer.append("rect")
                .attr("x", -230)
                .attr("y", -55)
                .attr("width", 460)
                .attr("height", 100)
                .attr("rx", 20)
                .attr("ry", 20)
                .attr("fill", "#f2f2f2")
                .attr("stroke", "#ccc")
                .attr("stroke-width", 2);

            messageContainer.append("text")
                .attr("x", 0)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .attr("font-size", "24px")
                .attr("font-weight", "bold")
                .attr("fill", "black")
                .text("No data corresponding to the selection");

            return;
        } else {
            this.heatmapGroup.selectAll("text").remove();
            this.heatmapGroup.selectAll("rect").remove();
        }

        const maxCount = d3.max(matrix, d => d.count);
        const colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain([0, maxCount]);

        const xScale = d3.scaleBand()
            .domain(topSourceIPs)
            .range([0, this.width])
            .padding(0.05);

        const yScale = d3.scaleBand()
            .domain(topDestIPs)
            .range([0, this.height])
            .padding(0.05);

        // Set up tooltip element
        const tooltip = d3.select("#tooltip-container");

        const classificationMap = {
            0: "Generic Protocol Command Decode",
            1: "Potential Corporate Privacy Violation",
            2: "Misc activity",
            3: "Attempted Information Leak",
            4: "Potentially Bad Traffic"
        };
        // use a unique key for each cell based on source and dest IP
        const cells = this.heatmapGroup.selectAll(".heatmap-cell")
            .data(matrix, d => `${d.sourceIP}-${d.destIP}`);

        // add new elements and display html tooltip on mouse hover
        cells.enter()
            .append("rect")
            .attr("class", "heatmap-cell")
            .attr("x", d => xScale(d.sourceIP))
            .attr("y", d => yScale(d.destIP))
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScale(d.count))
            .attr("stroke", d => {
                const isSelected = store.getState().heatmapConfig.selectedCells.some(cell => cell.x === d.x && cell.y === d.y);
                return isSelected ? "green" : "none";
            })
            .attr("stroke-width", d => filters.includes(d.classification) ? 2 : 1)
            .on("click", (event, d) => {
                store.dispatch(addSelectedCell({ x: d.x, y: d.y, data: d }));
                d3.select(event.target)
                    .attr("stroke", "green")
                    .attr("stroke-width", 2);
            })
            .on("mouseover", (event, d) => {
                tooltip.classed("visible", true)
                    .style("top", `${event.pageY + 10}px`)
                    .style("left", `${event.pageX + 10}px`)
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
                tooltip.style("top", `${event.pageY + 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", () => {
                tooltip.classed("visible", false);
            });

        // Remove old elements
        cells.exit().remove();

        this.heatmapGroup.selectAll(".axis").remove();
        this.heatmapGroup.selectAll(".axis-label").remove();
        this.heatmapGroup.selectAll(".tick").remove();

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
