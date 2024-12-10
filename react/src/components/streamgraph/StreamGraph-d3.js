import * as d3 from 'd3';

class StreamGraphD3 {
  constructor(svgElement, sliderElement) {
    this.classifications = [0, 1, 2, 3, 4, 5];
    
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

  render(data) {   
    this.defineClippingPath();
    // Call the function to prepare stacked data
    console.log("first element: ", data[0]);
    // Parse data: time and classification
    const parseTime = d3.timeParse('%d %H:%M');
    const preparedData = data
      .map((d) => ({
        time: parseTime(d.time),
        classification: d["classification"],
      }))
      .filter((d) => d.time !== null && d.classification !== undefined);

    const groupedData = d3.rollups(
      preparedData,
      (v) => v.length,
      (d) => d.time,
      (d) => d.classification
    );

    // Transform the data into a flat structure suitable for stacking.
    // Each entry in the stacked data contains:
    //   - time (used for the x-axis)
    //   - count for each classification.
    const stackedData = groupedData.map(([time, classData]) => {
      const classMap = new Map(classData);
      return this.classifications.reduce((acc, classification) => {
        acc[classification] = classMap.get(classification) || -1;
        acc.time = time;
        return acc;
      }, {});
    });

    this.xExtent = d3.extent(preparedData, (d) => d.time);

    this.x = d3.scaleTime()
      .domain(this.xExtent)
      .range([0, this.width]);

    this.y = d3.scaleLinear()
      .domain([0, d3.max(stackedData, (d) => this.classifications.reduce((sum, key) => sum + d[key], 0))])
      .range([this.height, 0]);

    this.color = d3.scaleOrdinal()
      .domain(this.classifications)
      .range(d3.schemeCategory10);

    // Use d3.stack to generate the data structure needed for a stacked area chart or stream graph.
    // The keys correspond to the classifications, and the stacked data is calculated based on `stackedData`.
    const stackGenerator = d3.stack().keys(this.classifications);
    this.stackedSeries = stackGenerator(stackedData);

    this.updateChart();

    // Create legend
    this.createLegend();

    // Zoom and Pan
    this.setupZoom();
  }

  setupZoom() {
    const zoom = d3.zoom()
      .scaleExtent([1, 70]) 
      .translateExtent([[0, 0], [this.width, this.height]]) 
      .extent([[0, 0], [this.width, this.height]])
      .on('zoom', (event) => this.zoomed(event))

    // Intercept the zoom event on the svg element
    this.svg.append('rect')
      .attr('class', 'zoom-rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .call(zoom);
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

  zoomed(event) {
    const newX = event.transform.rescaleX(this.x);
    this.chartArea.selectAll('path.layer')
      .attr('d', d3.area()
        .x(d => newX(d.data.time))
        .y0(d => this.y(d[0]))
        .y1(d => this.y(d[1]))
      );
    this.xAxisGroup.call(d3.axisBottom(newX));
  }

  createLegend() {
    this.svg.select('.legend').remove();
  
    const legend = this.svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${this.width + this.margin.right - 150}, ${this.margin.top})`); // placement
  
    this.color.domain().forEach((classification, index) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${index * 20})`); 
  
      legendRow.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', this.color(classification));
  
      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 10)
        .style('font-size', '12px')
        .style('alignment-baseline', 'middle') 
        .text(`Classification ${classification}`);
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
