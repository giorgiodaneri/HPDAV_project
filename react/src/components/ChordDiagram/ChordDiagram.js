import * as d3 from 'd3';

class ChordDiagram {
    margin = { top: 100, right: 100, bottom: 100, left: 100 };
    size;
    width;
    height;
    svg;
    chordGroup;

    ipCategories = [
        { type: 'Firewall', color: '#8dd3c7', priority: 'High' },
        { type: 'DNS Root Servers', color: '#ffffb3', priority: 'Normal' },
        { type: 'Websites', color: '#bebada', priority: 'Normal' },
        { type: 'IDS', color: '#fb8072', priority: 'High' },
        { type: 'Financial servers', color: '#80b1d3', priority: 'High' },
        { type: 'Domain controller / DNS', color: '#fdb462', priority: 'High' },
        { type: 'Log Server', color: '#b3de69', priority: 'High' },
        { type: 'Workstations', color: '#fccde5', priority: 'Normal' },
        { type: 'Unknown', color: '#d9d9d9', priority: 'Low' },
    ];
    

    ipMapping = {
        "10.32.0.x": "Firewall",
        "10.x.x.x": "Websites",
        "172.23.214.x": "Financial servers",
        "172.23.x.x": "Workstations",
        "10.99.99.2": "IDS",
        "172.23.0.10": "Domain controller / DNS",
        "172.23.0.2": "Log Server",
    };

    allowedServices = [
        'https', 'ftp', 'pptp', 'ms-sql-s', 'ms-sql-m', 'ingreslock',
        'netbios-ns', 'netbios-dgm', 'syslog', 'knetd', 'auth', 'wins'
    ];

    serviceColors = {
        'https': '#a6cee3',
        'ftp': '#1f78b4',
        'pptp': '#b2df8a',
        'ms-sql-s': '#33a02c',
        'ms-sql-m': '#fb9a99',
        'ingreslock': '#e31a1c',
        'netbios-ns': '#fdbf6f',
        'netbios-dgm': '#ff7f00',
        'syslog': '#cab2d6',
        'knetd': '#6a3d9a',
        'auth': '#ffff99',
        'wins': '#b15928'
    };
    

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

        const [day, rawTime] = timeStr.split(" ");
        if (!rawTime || !day) {
            console.warn("Invalid time format:", timeStr);
            return 0;
        }

        let timeParts = rawTime.split(":");
        // If there's no seconds, append ":00"
        if (timeParts.length === 2) {
            timeParts.push("00");
        }

        const [hours, minutes, seconds] = timeParts.map(Number);
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

        const hasSeconds = timeStr.split(" ")[1]?.split(":").length === 3;
        if (hasSeconds) {
            return timeStr;
        }

        const [day, time] = timeStr.split(" ");
        if (!day || !time) {
            console.warn("Invalid time format for conversion:", timeStr);
            return null;
        }

        return `${day} ${time}:00`;
    }

    // Map IP to color based on category, with a default color for unmatched IPs
    getColorForIP = (ip) => {
        const findCategory = (ip) => {
            for (const [pattern, category] of Object.entries(this.ipMapping)) {
                if (this.matchIP(ip, pattern)) {
                    return category;
                }
            }
            return "Unknown"; 
        };

        const category = findCategory(ip);
        const type = this.ipCategories.find(c => c.type === category);
        return type ? type.color : "#ccc"; 
    };

    // Match IP against the pattern (supports 'x' as wildcard)
    matchIP = (ip, pattern) => {
        const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/x/g, '\\d{1,3}');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(ip);
    };

    getServiceColor(service) {
        return this.serviceColors[service] || "#ccc";
    }

    renderChordDiagram(data, startTime, endTime, displayFirewall, dest_services, topIPsCount) {
        this.clear();

        //log dest_service
        console.log(`dest_services: ${dest_services}`);

        const filteredData = data.map(d => ({
            time: this.parseTime(d.time),
            sourceip: d.sourceip,
            destip: d.destip,
            dest_service: d.dest_service,
        }))
        .filter(d => d.time >= this.parseTime(startTime) && d.time <= this.parseTime(endTime))
        .filter(d => this.allowedServices.includes(d.dest_service)); // Only include allowed services

        const sourceCount = d3.rollup(filteredData, v => v.length, d => d.sourceip);
        const destCount = d3.rollup(filteredData, v => v.length, d => d.destip);

        const combinedCount = new Map();
        sourceCount.forEach((v, k) => combinedCount.set(k, (combinedCount.get(k) || 0) + v));
        destCount.forEach((v, k) => combinedCount.set(k, (combinedCount.get(k) || 0) + v));

        const topIPs = Array.from(combinedCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, topIPsCount)
            .map(d => d[0]);

        const ipIndex = new Map();
        topIPs.forEach((ip, i) => ipIndex.set(ip, i));

        const matrix = Array.from({ length: topIPs.length }, () => new Array(topIPs.length).fill(0));
        filteredData.forEach(d => {
            if (ipIndex.has(d.sourceip) && ipIndex.has(d.destip)) {
                matrix[ipIndex.get(d.sourceip)][ipIndex.get(d.destip)] += 1;
            }
        });

        const chords = d3.chord().padAngle(0.05)(matrix);

        // Aggregate most used dest_service for each connection
        const mostUsedServiceByConnection = d3.rollup(
            filteredData,
            v => {
                const serviceCounts = d3.rollup(v, d => d.length, d => d.dest_service);
                return Array.from(serviceCounts).sort((a, b) => b[1] - a[1])[0][0]; // Most frequent service
            },
            d => `${d.sourceip}-${d.destip}`
        );

        const arc = d3.arc()
            .innerRadius(this.radius - 20)
            .outerRadius(this.radius);

        const ribbon = d3.ribbon().radius(this.radius - 20);

        const group = this.chordGroup
            .selectAll("g.group")
            .data(chords.groups)
            .enter().append("g")
            .attr("class", "group");

        group.append("path")
            .attr("d", arc)
            .style("fill", d => this.getColorForIP(topIPs[d.index]))
            .style("stroke", d => d3.rgb(this.getColorForIP(topIPs[d.index])).darker());

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
            .style("fill", d => {
                const connectionKey = `${topIPs[d.source.index]}-${topIPs[d.target.index]}`;
                const mostUsedService = mostUsedServiceByConnection.get(connectionKey);
                return this.getServiceColor(mostUsedService);
            })
            .style("stroke", d => {
                const connectionKey = `${topIPs[d.source.index]}-${topIPs[d.target.index]}`;
                const mostUsedService = mostUsedServiceByConnection.get(connectionKey);
                //log info
                console.log(`Connection: ${topIPs[d.source.index]} → ${topIPs[d.target.index]}: Most Used Service: ${mostUsedService}`);
                return d3.rgb(this.getServiceColor(mostUsedService)).darker();
            })
            .append("title")
            .text(d => {
                const connectionKey = `${topIPs[d.source.index]}-${topIPs[d.target.index]}`;
                const mostUsedService = mostUsedServiceByConnection.get(connectionKey);
                return `${topIPs[d.source.index]} → ${topIPs[d.target.index]}: Most Used Service: ${mostUsedService}`;
            });

        // Add both legends
        this.addIPCategoryLegend();
        this.addServiceLegend();
    }

    addIPCategoryLegend() {
        const legend = this.svg.append("g")
            .attr("class", "ip-category-legend")
            .attr("transform", `translate(${this.size.width - 150}, 20)`);

        // Add title
        legend.append("text")
            .attr("x", 0)
            .attr("y", -10)
            .text("IP Categories")
            .style("font-size", "14px")
            .style("font-weight", "bold");

        this.ipCategories.forEach((category, i) => {
            const legendItem = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);

            legendItem.append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .style("fill", category.color);

            legendItem.append("text")
                .attr("x", 20)
                .attr("y", 12)
                .text(`${category.type}`)
                .style("font-size", "12px")
                .style("fill", "#000");
        });
    }

    addServiceLegend() {
        const legendData = Object.entries(this.serviceColors);

        const legend = this.svg.append("g")
            .attr("class", "service-legend")
            .attr("transform", `translate(${this.size.width - 300}, 20)`);

        // Add title
        legend.append("text")
            .attr("x", 0)
            .attr("y", -10)
            .text("Dest Services")
            .style("font-size", "14px")
            .style("font-weight", "bold");

        legend.selectAll("g.legend-item")
            .data(legendData)
            .enter().append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`)
            .each(function (d) {
                const [service, color] = d;

                d3.select(this).append("rect")
                    .attr("width", 15)
                    .attr("height", 15)
                    .style("fill", color);

                d3.select(this).append("text")
                    .attr("x", 20)
                    .attr("y", 12)
                    .text(service)
                    .style("font-size", "12px")
                    .style("fill", "#000");
            });
    }
}

export default ChordDiagram;
