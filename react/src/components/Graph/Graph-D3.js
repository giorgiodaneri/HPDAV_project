import * as d3 from 'd3';
import { colorMap, nodeWidthConstantMap } from './IPClassification';

class GraphD3 {
  constructor(svgElement) {
    this.svgElement = svgElement;
    this.svg = d3.select(svgElement);
    this.width = svgElement.clientWidth;
    this.height = svgElement.clientHeight;

    this.DSN_width = 60;
    this.DSN_height = 400;
    // Create a tooltip element
    this.tooltip = d3.select('body').append('div')
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "rgba(0,0,0,0.7)")
      .style("color", "white")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style('color', 'white')
      .style("pointer-events", "none");
  }
  
  initializeGraph(nodes, links) {
    this.svg.selectAll('*').remove(); // Clear previous graph

    // Define the fixed positions for each node based on its type
    nodes.forEach(node => {
      const [x, y] = this.getClusterCenter(node.value.type);
      node.x = x;
      node.y = y;
      if (node.value.type != 2 && node.value.type != 3) {
        node.r = Math.min(nodeWidthConstantMap[node.value.type] * (node.value.count / node.value.total_count), 20);
        node.r = Math.max(node.r, 4);
        node.opacity = 0.8;
      }
      else{
        node.r = 20;
        node.opacity = 0.7;
      }
      node.color = d3.color(colorMap[node.value.type]);
    });

    links.forEach(link => {
      link.opacity = this.getOpacity(link.value / link.max_value);
      link.color = d3.color('#100');
      link.strokeWidth = 2;
      link.borderColor = d3.color('#000');
    });

    
  const lineGenerator = d3.line()
    .curve(d3.curveBundle.beta(0.85)) // You can adjust the beta value for different curve tightness
    .x(d => d.x)
    .y(d => d.y);
  
  // Create the links with curves
  this.link = this.svg.append('g')
    .selectAll('path')
    .data(links)
    .enter().append('path')
    .attr('d', d => {
      const sourceNode = nodes.find(n => n.id === d.source);
      const targetNode = nodes.find(n => n.id === d.target);
      const midPoint = { x: (sourceNode.x + targetNode.x) / 2, y: (sourceNode.y + targetNode.y) / 2 };
      return lineGenerator([sourceNode, midPoint, targetNode]);
    })
    .attr('stroke-width', d => d.strokeWidth)
    .attr('opacity', d => d.opacity)
    .attr('stroke', d => d.color)
    .attr('fill', 'none');

    // Create the nodes
    this.node = this.svg.append('g')
      .selectAll('circle')
      .data(nodes.filter(d => d.value.type != 4)) // Seleziona i nodi di tipo diverso da 4
      .enter().append('circle')
      .attr('r', d => d.r)
      .attr('fill', d => d.color)
      .attr('opacity', d => d.opacity)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    this.updateGraph(nodes, links);

  }

  
  updateGraph(nodes, links) {

    links.forEach(link => {
      link.opacity = this.getOpacity(link.value / link.max_value);
      link.color = d3.color('#999');
      link.strokeWidth = Math.sqrt(link.value);
    });

    this.node = this.node.data(nodes.filter((d) => d.value.type != 4));
    this.node.exit().remove();
    this.node = this.node.enter().append('circle')
      .attr('r', d => d.r)
      .attr('fill', d=> d.color)
      .merge(this.node)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .on('mouseover', (event, d) => this.showTooltip(event, d))
      .on('mousemove', (event) => this.moveTooltip(event))
      .on('mouseout', () => this.hideTooltip());

    this.link = this.link.data(links);
    this.link.exit().remove();
    this.link = this.link.enter().append('line')
      .attr('stroke-width', d => d.strokeWidth)
      .attr('stroke', d => d.color)
      .attr('opacity', d => d.opacity)
      .merge(this.link)
      .attr('x1', d => nodes.find(n => n.id === d.source).x)
      .attr('y1', d => nodes.find(n => n.id === d.source).y)
      .attr('x2', d => this.getEdgePointX(d, nodes))
      .attr('y2', d => this.getEdgePointY(d, nodes));
  }
  
  getClusterCenter(type, value) {
    // Define the center position of the cluster based on the node type and value
    let x_center, y_center;
    let x, y;
    const margin = 40; // Margin from the edge of the screen
    let maxDistanceX;
    let maxDistanceY;

    if (type === 1) {
      // Left side of the screen
      x_center = this.width / 2;
      y_center = this.height / 2;
      [x, y] = this.getRandomPositionInCircle(x_center, y_center);
    } else if (type === 7 ) {
      // Right side of the screen
      x_center = this.width / 2;
      y_center = this.height / 2;
      do{
        x = margin + Math.random() * (this.width - margin - 50);
        y = margin + Math.random() * (this.height - margin - 50);
      }while(Math.sqrt(Math.pow(x - x_center, 2) + Math.pow(y - y_center, 2)) <= Math.min(this.width, this.height) / 3.5);

    } else {
      // Default to center
      x = this.width  - margin;
      y = this.height / 2;
    }

    return [x, y];
  }

  getOpacity(x){
    switch(x){
      case (x <= 0.1):
        return 0.1;
      case (x <= 0.2):
        return 0.15;
      case (x <= 0.3):
        return 0.20;
      case (x <= 0.4):
        return 0.25;
      case (x <= 0.5):
        return 0.4;
      case (x <= 0.6):
        return 0.5;
      case (x <= 0.7):
        return 0.53;
      case (x <= 0.8):
        return 0.5;
      case (x <= 0.9):
        return 0.8;
      case (x <= 1):
        return 1.0;
      default:
        return 0.1;
    }
  };

  getRandomPositionInCircle(centerX, centerY) {
    // Define a random position within a circle around the center
    const radius = Math.min(this.width, this.height) / 4;
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
    return [x, y];
  }

  getEdgePointX(d, nodes){
    let node = nodes.find(n => n.id === d.target);
    let x = node.x;
    let type = node.value.type;

    if(type != 4)
      return x;
    return this.width - 60 - this.DSN_width/2;
  }

  getEdgePointY(d, nodes){
    let node = nodes.find(n => n.id === d.target);
    let y = node.y;
    let type = node.value.type;

    let top = this.height/2 - this.DSN_height / 2;
    let bottom = this.height/2 + this.DSN_height / 2;

    if(type != 4)
      return y;
    if (y < top)
      return top;
    if (y > bottom)
      return bottom;
    return y;
  }

  highlightNodesByIP(selectedCells) {
    // Reset all nodes to their original stroke and stroke-width
    this.node
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Highlight only the nodes present in selectedCells
    selectedCells.forEach(cell => {
      const sourceIP = cell.data.sourceIP;
      const targetIP = cell.data.targetIP;
      this.node
        .filter(d => d.id === sourceIP || d.id === targetIP)
        .attr('stroke', 'green')
        .attr('stroke-width', 4);
    });
  }

  showTooltip(event, d) {
    this.tooltip.html(`
      <strong>IP:</strong> ${d.id}<br>
      <strong>Connections:</strong> ${d.value.count}<br>
      <strong>DNS connections:</strong> ${d.value.dns_connection}<br>
      `)
      .style('visibility', 'visible')
      .style('top', (event.pageY - 10) + 'px')
      .style('left', (event.pageX + 10) + 'px');
  }

  moveTooltip(event) {
    this.tooltip.style('top', (event.pageY - 10) + 'px')
      .style('left', (event.pageX + 10) + 'px');
  }

  hideTooltip() {
    this.tooltip.style('visibility', 'hidden');
  }
}

export default GraphD3;