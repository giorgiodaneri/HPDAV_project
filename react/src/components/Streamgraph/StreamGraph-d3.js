import * as d3 from 'd3';

class StreamGraphD3 {
  constructor(svgElement, sliderElement) {
    this.zoomTransform = null; // Store the zoom state
    this.brushedCallback = null; // Callback for brush events
    this.currentBrushSelection = null; // Store the current brush selection
    this.classifications = [0, 1, 2, 3, 4];
    this.classifications_labels = ["Generic Protocol Command Decode", "Potential Corporate Privacy Violation", "Misc activity", "Attempted Information Leak", "Potentially Bad Traffic"];
    
    // Initialize properties related to dimensions and elements
    this.initializeProperties(svgElement, sliderElement);

    // Set up the basic SVG structure, including chart area and axes groups
    this.setupSVGStructure();
    
  }

  initializeProperties(svgElement, sliderElement) {
    this.svgElement = svgElement;
    this.sliderElement = sliderElement;

    this.margin = { top: 50, right: 50, bottom: 50, left: 50 };

    this.width = svgElement.clientWidth - this.margin.left - this.margin.right;
    this.height = svgElement.clientHeight - this.margin.top - this.margin.bottom;

    if (this.width <= 0 || this.height <= 0) {
      console.error('SVG element has zero width or height. Check parent container dimensions.');
    }
  }

  setupSVGStructure() {
    this.svg = d3.select(this.svgElement)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.chartArea = this.svg.append('g').attr('class', 'chartArea');

    this.xAxisGroup = this.svg.append('g')
      .attr('class', 'xAxisG')
      .attr('transform', `translate(0,${this.height})`)
      .call((g) => {
        g.append('text')
          .attr('class', 'xAxisLabel')
          .attr('x', this.width / 2)
          .attr('y', this.margin.bottom - 10)
          .attr('fill', 'black')
          .style('text-anchor', 'middle');
      });

    this.yAxisGroup = this.svg.append('g')
      .attr('class', 'yAxisG')
      .call((g) => {
        g.append('text')
          .attr('class', 'yAxisLabel')
          .attr('transform', 'rotate(-90)')
          .attr('x', -this.height / 2)
          .attr('y', -this.margin.left + 10)
          .attr('fill', 'black')
          .style('text-anchor', 'middle');
      });
  }

  render(data, selectedClassifications, startTime, endTime, aggregationInterval) {
    this.defineClippingPath();
  
    const parseTime = d3.timeParse('%d %H:%M');
    const formatTime = d3.timeFormat('%Y-%m-%d %H:%M');
    const roundToInterval = (date, intervalMinutes) => {
      const ms = date.getTime();
      const intervalMs = intervalMinutes * 60 * 1000;
      return new Date(Math.floor(ms / intervalMs) * intervalMs);
    };
  
    // Prepare and filter data
    const preparedData = data
      .map((d) => ({
        time: parseTime(d.time),
        classification: d['classification'],
      }))
      .filter(
        (d) =>
          d.time !== null &&
          d.classification !== undefined &&
          d.time >= parseTime(startTime) &&
          d.time <= parseTime(endTime)
      );
  
    // Group data into intervals based on aggregationInterval
    const groupedData = d3.rollups(
      preparedData,
      (v) => v.length,
      (d) => formatTime(roundToInterval(d.time, aggregationInterval)),
      (d) => d.classification
    );
  
    // Convert grouped data into a stacked format
    const stackedData = groupedData.map(([time, classData]) => {
      const classMap = new Map(classData);
      return this.classifications.reduce((acc, classification) => {
        acc[classification] = classMap.get(classification) || 0;
        acc.time = new Date(time); // Convert time back to Date object
        return acc;
      }, {});
    });
  
    // Update scales and render
    this.xExtent = d3.extent(stackedData, (d) => d.time);
    this.x = d3.scaleTime().domain(this.xExtent).range([0, this.width]);
  
    this.y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(stackedData, (d) =>
          selectedClassifications.reduce((sum, key) => sum + d[key], 0)
        ),
      ])
      .range([this.height, 0]);
  
    this.color = d3
      .scaleOrdinal()
      .domain(this.classifications)
      .range(d3.schemeCategory10);
  
    const stackGenerator = d3.stack().keys(selectedClassifications);
    this.stackedSeries = stackGenerator(stackedData);
  
    this.updateChart();
    //this.createLegend();
    this.setupZoom();
    this.setupBrush();
  }
  

  setBrushedCallback(callback) {
    this.brushedCallback = callback; // Assign the callback to the instance
  }
  
  clearBrush() {
    console.log("Clearing brush...");
    if (this.brushGroup) {
      this.brushGroup.call(d3.brushX().clear);
      this.currentBrushSelection = null; 
    }
  }
  
  setupBrush() {
    const brush = d3
    .brushX()
    .extent([[0, 0], [this.width, this.height]])
    .on("start", () => {
      console.log("Brushing started, disabling zoom");
      // Disable zooming during brushing
      d3.select(this.svgElement).on(".zoom", null);
    })
    .on("brush", (event) => this.updateBrushedData(event))
    .on("end", (event) => {
      this.updateBrushedData(event);
      console.log("Brushing ended, re-enabling zoom");
      // Re-enable zooming after brushing
      this.enableZoom();
    });

    this.brushGroup = this.svg.append("g").attr("class", "brush").call(brush);
  }

  updateBrushedData(event) {
    const selection = event.selection || this.currentBrushSelection;
  
    if (!selection) {
      return;
    }
  
    this.currentBrushSelection = selection; // Save the current brush selection
    const [startX, endX] = selection.map(this.x.invert); // Convert pixel range to time
    const selectedRange = [startX.toISOString(), endX.toISOString()];
  
    // Filter the classifications based on the brushed range
    const brushedClassifications = this.stackedSeries
      .filter((layer) =>
        layer.some(
          (d) => d.data.time >= startX && d.data.time <= endX
        )
      )
      .map((layer) => layer.key); // Extract the classification keys
      //console.log(brushedClassifications);
      //console.log(selectedRange);
    if (this.brushedCallback) {
      this.brushedCallback({ range: selectedRange, classifications: brushedClassifications });
    }
  }
  
  updateSelectedClassifications(selectedClassifications) {
    if (!this.data) {
      console.error("No data available to update classifications");
      return;
    }
  
    this.render(this.data, selectedClassifications); // Re-render the graph with the updated classifications
  
    if (this.currentBrushSelection) {
      // Reapply the brush logic with the updated classifications
      this.updateBrushedData({ selection: this.currentBrushSelection });
    }
  }
  
  setupZoom() {
    this.zoom = d3
      .zoom()
      .scaleExtent([1, 10]) // Limit the zoom scale
      .translateExtent([[0, 0], [this.width, this.height]]) // Limit panning
      .on("zoom", (event) => this.zoomed(event));
  
    // Apply the zoom behavior initially
    this.enableZoom();
  }
  enableZoom() {
    d3.select(this.svgElement).call(this.zoom);
  }
  disableZoom() {
    d3.select(this.svgElement).on(".zoom", null); // Remove the zoom behavior
  }
  zoomed(event) {
    this.zoomTransform = event.transform; // Save the zoom state
    const newX = this.zoomTransform.rescaleX(this.x);

    this.chartArea
      .selectAll('path.layer')
      .attr(
        'd',
        d3
          .area()
          .x((d) => newX(d.data.time))
          .y0((d) => this.y(d[0]))
          .y1((d) => this.y(d[1]))
      );

    this.xAxisGroup.call(d3.axisBottom(newX));
  }

  updateChart() {
    // Redraw chartArea
    this.chartArea.selectAll('path.layer')
      .data(this.stackedSeries)
      .join('path')
      .attr('class', 'layer')
      .attr('fill', (d) => this.color(d.key))
      .attr('d', d3.area()
        .x((d) => this.x(d.data.time))
        .y0((d) => this.y(d[0]))
        .y1((d) => this.y(d[1]))
      );

    // Update axis
    this.xAxisGroup.call(d3.axisBottom(this.x));
    this.xAxisGroup.select('.xAxisLabel').text('Time');
    this.yAxisGroup.call(d3.axisLeft(this.y));
    this.yAxisGroup.select('.yAxisLabel').text('Classification');
  }

  createLegend() {
    this.svg.select('.legend').remove();
    
    const legend = d3
      .select(this.svgElement) // Append the legend outside the main SVG group
      .append('g')
      .attr(
        'transform',
        `translate(${this.margin.left}, ${this.margin.top - 40})` // Position legend above the plot
      );
      
    this.color.domain().forEach((classification, index) => {
      const legendRow = legend
    .append('g')
    .attr(
      'transform',
      `translate(${(index % 3) * (300)}, ${
        Math.floor(index / 3) * (20 )
      })`
    )
  
      legendRow
        .append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', this.color(classification));
  
      legendRow
        .append('text')
        .attr('x', 20)
        .attr('y', 10)
        .style('font-size', '12px')
        .style('alignment-baseline', 'middle')
        .text(this.classifications_labels[classification]);
    });
  }
  
  
  // A clipping path restricts the rendering of graphical elements to a defined region
  // It avoids that parts of the graph move outside the visible viewport when zoomed and panned
  defineClippingPath() {
    // Define the clipping path
    this.svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", this.width)
      .attr("height", this.height);
  
    // Apply the clipping path to the chart area
    this.chartArea.attr("clip-path", "url(#clip)");
  }
}

export default StreamGraphD3;
