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
            .attr('y', -this.margin.left + 15)
            .text('Occurrences');
    }

    clear() {
        if (this.svg) {
            this.svg.remove();
        }
        this.svg = null;
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

    formatTime(minutes) {
        const days = Math.floor(minutes / 1440);
        const hours = Math.floor((minutes % 1440) / 60);
        const mins = minutes % 60;
        const secs = Math.round((mins % 1) * 60);
        return `${days} ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${String(secs).padStart(2, '0')}`;
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

    renderHistogram(data, binWidth, startTime, endTime) {
        this.binWidth = binWidth;

        // Convert startTime and endTime to include seconds
        const formattedStartTime = this.convertToSecondsFormat(startTime);
        const formattedEndTime = this.convertToSecondsFormat(endTime);

        if (!formattedStartTime || !formattedEndTime) {
            console.error("Failed to format start or end time");
            return;
        }
    
        const parsedStartTime = this.parseTime(formattedStartTime);
        const parsedEndTime = this.parseTime(formattedEndTime);

        // Parse time values and filter data within the desired range
        const parsedData = data.map(d => this.parseTime(d.time)).filter(d => !isNaN(d));

        const filteredData = parsedData.filter(d => {
            // const time = this.parseTime(d.time);
            const time = d;
            return time >= parsedStartTime && time <= parsedEndTime;
        });

        const x = d3.scaleLinear()
            .domain(d3.extent(filteredData)) // Set domain based on the data extent
            .range([0, this.width]);

        // Create bins using d3.bin
        const bin = d3.bin()
            .thresholds(d3.range(d3.min(filteredData), d3.max(filteredData), this.binWidth));

        // Calculate bins based on the time data
        const bins = bin(filteredData);

        // Calculate the number of items within each bin
        bins.forEach(d => {
            d.count = d.length;  // Store the count of data points in each bin
        });

        // Calculate the maximum count to scale the y-axis properly
        const maxCount = d3.max(bins, d => d.count);

        // Create the y scale based on the max count
        const y = d3.scaleLinear()
            .domain([0, maxCount])  // Set y-domain to be from 0 to the max count in the bins
            .range([this.height, 0]);

        // Update the axes
        const xAxis = d3.axisBottom(x)
            .ticks(15)
            .tickFormat(d => this.formatTime(d)); // Format x-axis labels as D HH:MM

        const yAxis = d3.axisLeft(y).ticks(5);


        this.chart.select('.x-axis').call(xAxis).selectAll('text').attr('transform', 'rotate(-45)').style('text-anchor', 'end');
        this.chart.select('.y-axis').call(yAxis).selectAll('text').attr('transform', 'translate(-10,0)');

        // move x axis label down
        this.chart.select('.x-label').attr('x', this.width / 2).attr('y', this.height + this.margin.bottom -2);

        // Bind data to bars (bins)
        const bars = this.chart.selectAll('.bar')
            .data(bins);

        // Enter new bars
        bars.enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.x0)) // Position the bar at the start of the bin
            .attr('y', d => y(d.count)) // Set the y position based on the count
            .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1)) // Width of the bin
            .attr('height', d => this.height - y(d.count)) // Bar height based on the count of items
            .style('fill', 'steelblue');

        // Update existing bars
        bars.attr('x', d => x(d.x0))
            .attr('y', d => y(d.count))
            .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
            .attr('height', d => this.height - y(d.count));

        // Remove old bars
        bars.exit().remove();
    }
    
}

export default Histogram;
