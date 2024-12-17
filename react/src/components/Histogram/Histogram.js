import * as d3 from 'd3';

class Histogram {
    constructor(container) {
        this.container = container;
        this.svg = null;
        this.margin = { top: 20, right: 20, bottom: 60, left: 50 };
        this.width = 0;
        this.height = 0;
        this.binWidth = 20;
    }

    create({ size }) {
        const { width, height } = size;
        this.width = width - this.margin.left - this.margin.right;
        this.height = height - this.margin.top - this.margin.bottom;

        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        this.chart.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${this.height})`);

        this.chart.append('g')
            .attr('class', 'y-axis');

        this.chart.append('text')
            .attr('class', 'x-label')
            .attr('text-anchor', 'middle')
            .attr('x', this.width / 2)
            .attr('y', this.height + this.margin.bottom - 5)
            .text('Time (minutes)');

        this.chart.append('text')
            .attr('class', 'y-label')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .attr('x', -this.height / 2)
            .attr('y', -this.margin.left + 14)
            .text('Occurrences');
    }

    clear() {
        if (this.svg) {
            this.svg.remove();
        }
        this.svg = null;
    }

    // method to parse time into a string of seconds
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

    // method to format time in D HH:MM format to be displayed on the x-axis
    formatTimeAxis(minutes) {
        const days = Math.floor(minutes / 1440);
        const hours = Math.floor((minutes % 1440) / 60);
        const mins = minutes % 60;
        return `${days} ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    convertToSecondsFormat(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') {
            console.warn("Invalid or missing time string:", timeStr);
            return null;
        }
        // check if timeStr already has seconds (D HH:MM:SS format)
        const hasSeconds = timeStr.split(" ")[1]?.split(":").length === 3;
        if (hasSeconds) {
            return timeStr; 
        }
        // append ":00" to add seconds
        const [day, time] = timeStr.split(" ");
        if (!day || !time) {
            console.warn("Invalid time format for conversion:", timeStr);
            return null;
        }
        return `${day} ${time}:00`;
    }

    renderHistogram(data, binWidth, startTime, endTime, dest_services, selected_ip, ipToggle, showAllServices) {
        this.binWidth = binWidth;    
        // clear all existing elements before rerendering
        this.chart.selectAll('*').remove();
        if (dest_services.length === 0 || binWidth === 0) {
            // show a message when no services are selected or the bin width is 0
            this.chart.append('text')
                .attr('x', this.width / 2)
                .attr('y', this.height / 2)
                .attr('text-anchor', 'middle')
                .style('font-size', '16px')
                .style('fill', 'gray')
                .style('font-family', 'Arial, sans-serif')
                .text('No service selected');
            return; 
        }
    
        // convert startTime and endTime to include seconds
        const formattedStartTime = this.convertToSecondsFormat(startTime);
        const formattedEndTime = this.convertToSecondsFormat(endTime);
        if (!formattedStartTime || !formattedEndTime) {
            console.error("Failed to format start or end time");
            return;
        }
        const parsedStartTime = this.parseTime(formattedStartTime);
        const parsedEndTime = this.parseTime(formattedEndTime);
        // parse time values and filter data within the desired range
        let filteredData = data.map(d => ({
            time: this.parseTime(d.time),
            sourceip: d.sourceip,
            destip: d.destip,
            dest_service: d.dest_service,
            dest_port: d.dest_port,
            protocol: d.protocol,
            action: d.action
        })).filter(d => !isNaN(d.time));

        // filter data based on selected_ip, if provided
        if (selected_ip.length > 0) {
            if(ipToggle){
                const ipExists = filteredData.some(d => d.destip === selected_ip);
                if (ipExists) {
                    filteredData = filteredData.filter(d => d.destip === selected_ip);
                } 
                else {
                    this.chart.append('text')
                        .attr('x', this.width / 2)
                        .attr('y', this.height / 2)
                        .attr('text-anchor', 'middle')
                        .style('font-size', '16px')
                        .style('fill', 'gray')
                        .style('font-family', 'Arial, sans-serif')
                        .text('No data corresponding to the selected IP');
                    return; 
                }
            } else {
                const ipExists = filteredData.some(d => d.sourceip === selected_ip);
                if (ipExists) {
                    filteredData = filteredData.filter(d => d.sourceip === selected_ip);
                } else {
                    this.chart.append('text')
                        .attr('x', this.width / 2)
                        .attr('y', this.height / 2)
                        .attr('text-anchor', 'middle')
                        .style('font-size', '16px')
                        .style('fill', 'gray')
                        .style('font-family', 'Arial, sans-serif')
                        .text('No data corresponding to the selected IP');
                    return; 
                }
            }
        }
        // if the user did not check the "Show All Services" checkbox, filter data based on dest_services
        if(!showAllServices){
            filteredData = filteredData.filter(d => {
                const serviceFilter = dest_services.length === 0 || dest_services.includes(d.dest_service);
                return serviceFilter;
            });
        }
        const timeValues = filteredData.map(d => d.time);
        const timeInRange = timeValues.filter(time => time >= parsedStartTime && time <= parsedEndTime);
        const uniqueDestServices = Array.from(new Set(filteredData.map(d => d.dest_service)));

        let xDomain = d3.extent(timeInRange);
        if (xDomain[0] === xDomain[1]) {
            const center = xDomain[0];
            xDomain = [center - binWidth, center + binWidth];
        }
        // adjust the domain to include the full width of the last bin, otherwise it will be cut off
        xDomain[0] = xDomain[0] - (binWidth/2);
        xDomain[1] = xDomain[1] + binWidth;
        const x = d3.scaleLinear()
            .domain(xDomain)
            .range([0, this.width]);
        const bin = d3.bin()
        .domain(xDomain)
        .thresholds(Math.ceil((xDomain[1] - xDomain[0]) / binWidth));
        // compute bins based on the time data
        const bins = bin(timeInRange);
        // ensure the last bin is included
        if (bins.length > 0 && bins[bins.length - 1].x1 < xDomain[1]) {
            bins.push({
                x0: bins[bins.length - 1].x1,
                x1: xDomain[1],
                groups: new Map()
            });
        }
        // group data in each bin by dest_service
        bins.forEach(bin => {
            bin.groups = d3.group(
                filteredData.filter(d => d.time >= bin.x0 && d.time < bin.x1),
                d => d.dest_service
            );
        });
        // define custom colors for each service that can be selected (13 in total)
        const customColors = [
            '#1f77b4', '#ff0000', '#2ca02c', '#d62728', '#9467bd',
            '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
            '#8a2be2', '#ff6347', '#32cd32'
        ];
        // default color
        let colorScale = d => '#32cd32'; 
        if (uniqueDestServices.length <= 13) {
            colorScale = d3.scaleOrdinal(customColors).domain(uniqueDestServices);
        }
        // compute the max stacked height for y-axis scaling
        const maxStackHeight = d3.max(bins, bin =>
            d3.sum([...bin.groups.values()].map(group => group.length))
        );
        const y = d3.scaleLinear()
            .domain([0, maxStackHeight])
            .range([this.height, 0]);
        const xAxis = d3.axisBottom(x)
            .ticks(25)
            .tickFormat(d => this.formatTimeAxis(d));
        const yAxis = d3.axisLeft(y).ticks(5);
        this.chart.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${this.height})`)
            .call(xAxis)
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');    
        this.chart.append('g')
            .attr('class', 'y-axis')
            .call(yAxis)
            .selectAll('text')
            .attr('transform', 'translate(-10,0)')
        this.chart.append('text')
            .attr('class', 'x-label')
            .attr('x', this.width / 2)
            .attr('y', this.height + this.margin.bottom - 2)
            .style('text-anchor', 'middle')
            .text('Time');
        this.chart.append('text')
            .attr('class', 'y-label')
            .attr('x', -this.height / 2)
            .attr('y', -this.margin.left + 10)
            .attr('transform', 'rotate(-90)')
            .style('text-anchor', 'middle')
            .text('Count');
    
        // bind bins to bar groups
        const barGroups = this.chart.selectAll('.bar-group')
            .data(bins, d => d.x0); 
        // append new bar groups
        const newBarGroups = barGroups.enter()
            .append('g')
            .attr('class', 'bar-group')
            .attr('transform', d => `translate(${x(d.x0)}, 0)`);
        // add or update stacked rectangles within each bar group
        newBarGroups.merge(barGroups)
            .selectAll('rect')
            .data(d => {
                let cumulativeHeight = 0;
                return [...d.groups.entries()].map(([service, group]) => {
                    const count = group.length;
                    const yStart = cumulativeHeight;
                    cumulativeHeight += count;
                    return { service, count, yStart, x0: d.x0, x1: d.x1 };
                });
            })
            .join(
                enter => enter.append('rect')
                    .attr('x', 0)
                    .attr('y', d => y(d.yStart + d.count))
                    .attr('width', d => {
                        const x0 = x(d.x0) || 0;
                        const x1 = x(d.x1) || 0;
                        return Math.max(0, x1 - x0 - 1);
                    })
                    .attr('height', d => y(d.yStart) - y(d.yStart + d.count))
                    .style('fill', d => colorScale(d.service)),
                update => update
                    .attr('y', d => y(d.yStart + d.count))
                    .attr('width', d => {
                        const x0 = x(d.x0) || 0;
                        const x1 = x(d.x1) || 0;
                        return Math.max(0, x1 - x0 - 1);
                    })
                    .attr('height', d => y(d.yStart) - y(d.yStart + d.count))
                    .style('fill', d => colorScale(d.service)),
                exit => exit.remove()
            );
    
        // add legend if the user did not check the "Show All Services" checkbox
        if (uniqueDestServices.length <= 13) {
            const legend = this.chart.append('g')
                .attr('class', 'legend')
                .attr('transform', `translate(-45, -20)`);
            const legendItems = legend.selectAll('.legend-item')
                .data(uniqueDestServices)
                .enter().append('g')
                .attr('class', 'legend-item')
                .attr('transform', (d, i) => `translate(${i * 90}, 0)`);
            legendItems.append('rect')
                .attr('width', 12)
                .attr('height', 12)
                .style('fill', d => colorScale(d));
            legendItems.append('text')
                .attr('x', 15)
                .attr('y', 7)
                .style('font-size', '14px')
                .style('font-family', 'Arial')
                .attr('dy', '.35em')
                .text(d => d);
        }
    }    
}

export default Histogram;