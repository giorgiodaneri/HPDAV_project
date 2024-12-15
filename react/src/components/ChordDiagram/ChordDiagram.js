import * as d3 from 'd3';

class ChordDiagram {
    margin = { top: 100, right: 100, bottom: 100, left: 100 }; 
    size;
    width;
    height;
    svg;
    chordGroup;

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
        this.radius = Math.min(this.width, this.height) / 2;

        this.svg
            .attr("width", this.size.width)
            .attr("height", this.size.height)
            .style("overflow", "visible"); // Prevent clipping

        this.svg.selectAll("*").remove();

        this.chordGroup = this.svg.append("g")
            .attr("transform", `translate(${this.size.width / 2},${this.size.height / 2})`);
    }

    clear() {
        this.chordGroup && this.chordGroup.selectAll("*").remove();
    }

    renderChordDiagram(data) {
        console.log("Data in chord diagram:", data);
        this.clear();

        // Ensure property names match the actual data keys
        const sourceCount = d3.rollup(data, v => v.length, d => d.sourceip);
        const destCount = d3.rollup(data, v => v.length, d => d.destip);

        const combinedCount = new Map();
        sourceCount.forEach((val, key) => {
            combinedCount.set(key, (combinedCount.get(key) || 0) + val);
        });
        destCount.forEach((val, key) => {
            combinedCount.set(key, (combinedCount.get(key) || 0) + val);
        });

        const topIPs = Array.from(combinedCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(d => d[0]);

        if (topIPs.length === 0) {
            const messageContainer = this.chordGroup.append("g");
            messageContainer.append("text")
                .attr("text-anchor", "middle")
                .attr("font-size", "24px")
                .attr("font-weight", "bold")
                .attr("fill", "black")
                .text("No data available");
            return;
        }

        const ipIndex = new Map();
        topIPs.forEach((ip, i) => ipIndex.set(ip, i));

        const matrix = Array.from({ length: topIPs.length }, () => new Array(topIPs.length).fill(0));
        for (const row of data) {
            const src = row.sourceip;
            const dst = row.destip;
            if (ipIndex.has(src) && ipIndex.has(dst)) {
                matrix[ipIndex.get(src)][ipIndex.get(dst)] += 1;
            }
        }

        const chord = d3.chord()
            .padAngle(0.05)
            .sortSubgroups(d3.descending);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const chords = chord(matrix);

        const arc = d3.arc()
            .innerRadius(Math.max(0, this.radius - 20))
            .outerRadius(Math.max(0, this.radius));

        const ribbon = d3.ribbon()
            .radius(Math.max(0, this.radius - 20));

        console.log("Radius:", this.radius);
        console.log("Inner Radius:", this.radius - 20);
        console.log("Matrix:", matrix);

        const group = this.chordGroup
            .selectAll("g.group")
            .data(chords.groups)
            .enter().append("g")
            .attr("class", "group");

        group.append("path")
            .style("fill", d => color(d.index))
            .style("stroke", d => d3.rgb(color(d.index)).darker())
            .attr("d", arc);


        group.append("text")
            .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .attr("transform", d => `
                rotate(${(d.angle * 180 / Math.PI - 90)})
                translate(${this.radius + 10}) 
                ${d.angle > Math.PI ? "rotate(180)" : ""}
            `)
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : "start")
            .text(d => topIPs[d.index])
            .style("font-size", "12px") // Adjust label size
            .style("fill", "#000");

        this.chordGroup
            .selectAll("path.ribbon")
            .data(chords)
            .enter().append("path")
            .attr("class", "ribbon")
            .attr("d", ribbon)
            .style("fill", d => color(d.target.index))
            .style("stroke", d => d3.rgb(color(d.target.index)).darker())
            .append("title")
            .text(d => {
                return `${topIPs[d.source.index]} → ${topIPs[d.target.index]}: ${matrix[d.source.index][d.target.index]}
${topIPs[d.target.index]} → ${topIPs[d.source.index]}: ${matrix[d.target.index][d.source.index]}`;
            });
    }
}

export default ChordDiagram;
