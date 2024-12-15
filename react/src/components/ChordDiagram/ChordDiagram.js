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
            .style("overflow", "visible");

        this.svg.selectAll("*").remove();

        this.chordGroup = this.svg.append("g")
            .attr("transform", `translate(${this.size.width / 2},${this.size.height / 2})`);
    }

    clear() {
        this.chordGroup && this.chordGroup.selectAll("*").remove();
    }

    formatTime(minutes) {
        const days = Math.floor(minutes / 1440);
        const hours = Math.floor((minutes % 1440) / 60);
        const mins = minutes % 60;
        const secs = Math.round((mins % 1) * 60);
        return `${days} ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${String(secs).padStart(2, '0')}`;
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

        const [hours, minutes, seconds] = time.split(":").map(Number);
        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
            console.warn("Invalid time format (hours, minutes, or seconds are NaN):", timeStr);
            return 0;
        }

        return day * 1440 + hours * 60 + minutes + seconds / 60;
    }

    convertToSecondsFormat(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') {
            console.warn("Invalid or missing time string:", timeStr);
            return null;
        }

        // Check if timeStr already has seconds (D HH:MM:SS format)
        const hasSeconds = timeStr.split(" ")[1]?.split(":").length === 3;
        if (hasSeconds) {
            return timeStr; // Already in correct format
        }

        // Append ":00" to add seconds
        const [day, time] = timeStr.split(" ");
        if (!day || !time) {
            console.warn("Invalid time format for conversion:", timeStr);
            return null;
        }

        return `${day} ${time}:00`;
    }

    renderChordDiagram(data, startTime, endTime, displayFirewall, dest_services, topIPsCount) {
        this.clear();
    
        // Convert and parse the time range
        const formattedStartTime = this.convertToSecondsFormat(startTime);
        const formattedEndTime = this.convertToSecondsFormat(endTime);
    
        if (!formattedStartTime || !formattedEndTime) {
            console.error("Failed to format start or end time");
            return;
        }
    
        const parsedStartTime = this.parseTime(formattedStartTime);
        const parsedEndTime = this.parseTime(formattedEndTime);
    
        console.log("Start time (parsed):", parsedStartTime, "End time (parsed):", parsedEndTime);
    
        // Parse time values and filter data within the desired range
        let filteredData = data.map(d => ({
            time: this.parseTime(d.time),
            sourceip: d.sourceip,
            destip: d.destip,
            dest_service: d.dest_service,
            dest_port: d.dest_port,
            protocol: d.protocol,
            action: d.action
        })).filter(d => !isNaN(d.time));
    
        console.log("Data after parsing time:", filteredData);
    
        filteredData = filteredData.filter(d => {
            const serviceFilter = dest_services.length === 0 || dest_services.includes(d.dest_service);
            const excludeServices = !['telnet', 'https', 'domain', 'kpop'].includes(d.dest_service);
            return serviceFilter && excludeServices;
        });
    
        console.log("Filtered data (length):", filteredData.length, "Filtered data:", filteredData);
    
        if (filteredData.length === 0) {
            console.warn("No data available after filtering");
            this.chordGroup.append("text")
                .attr("text-anchor", "middle")
                .attr("font-size", "24px")
                .attr("font-weight", "bold")
                .attr("fill", "black")
                .text("No data available");
            return;
        }
    
        // Aggregate data for the chord diagram
        const sourceCount = d3.rollup(filteredData, v => v.length, d => d.sourceip);
        const destCount = d3.rollup(filteredData, v => v.length, d => d.destip);
    
        console.log("Source count:", Array.from(sourceCount));
        console.log("Destination count:", Array.from(destCount));
    
        const combinedCount = new Map();
        sourceCount.forEach((val, key) => {
            combinedCount.set(key, (combinedCount.get(key) || 0) + val);
        });
        destCount.forEach((val, key) => {
            combinedCount.set(key, (combinedCount.get(key) || 0) + val);
        });
    
        console.log("Combined count:", Array.from(combinedCount));
        
        const topIPs = Array.from(combinedCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, topIPsCount) // Use the topIPsCount parameter
            .map(d => d[0]);
    
        console.log("Top IPs:", topIPs);
    
        const ipIndex = new Map();
        topIPs.forEach((ip, i) => ipIndex.set(ip, i));
    
        const matrix = Array.from({ length: topIPs.length }, () => new Array(topIPs.length).fill(0));
        for (const row of filteredData) {
            const src = row.sourceip;
            const dst = row.destip;
            if (ipIndex.has(src) && ipIndex.has(dst)) {
                matrix[ipIndex.get(src)][ipIndex.get(dst)] += 1;
            }
        }
    
        console.log("Matrix:", matrix);
    
        const chord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending);
        const chords = chord(matrix);
    
        console.log("Chords:", chords);
    
        const color = d3.scaleOrdinal(d3.schemeCategory10);
    
        const arc = d3.arc()
            .innerRadius(Math.max(0, this.radius - 20))
            .outerRadius(Math.max(0, this.radius));
    
        const ribbon = d3.ribbon()
            .radius(Math.max(0, this.radius - 20));
    
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
            .style("font-size", "12px")
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
            .text(d => `${topIPs[d.source.index]} → ${topIPs[d.target.index]}: ${matrix[d.source.index][d.target.index]}`);
    }
    
}

export default ChordDiagram;
