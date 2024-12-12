import * as d3 from 'd3';
import { colorMap, nodeWidthConstantMap } from './IPClassification';

class GraphD3 {
  constructor(svgElement) {
    this.svgElement = svgElement;
    this.svg = d3.select(svgElement);
    this.width = svgElement.clientWidth;
    this.height = svgElement.clientHeight;

    // Create a tooltip element
    this.tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '5px')
      .style('border-radius', '5px')
      .style('box-shadow', '0 0 5px rgba(0,0,0,0.3)');
  }
  
  initializeGraph(nodes, links) {
    this.svg.selectAll('*').remove(); // Clear previous graph

    // Define the fixed positions for each node based on its type
    nodes.forEach(node => {
      const [centerX, centerY] = this.getClusterCenter(node.value.type);
      const [x, y] = this.getRandomPositionInCircle(centerX, centerY);
      node.x = x;
      node.y = y;
      if (node.value.type != 2 && node.value.type != 3) {
        node.r = Math.min(nodeWidthConstantMap[node.value.type] * (node.value.count / node.value.total_count), 20);
        node.opacity = 0.8;
      }
      else{
        node.r = 20;
        node.opacity = 0.7;
      }
      node.color = d3.color(colorMap[node.value.type]);
    });

    links.forEach(link => {
      link.opacity =  1 * (link.value / link.max_value);
      link.color = d3.color('#100');
      link.strokeWidth = 2;
      link.borderColor = d3.color('#000');
    });

    // Create the links
    this.link = this.svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', d => d.strokeWidth)
      .attr('opacity', d => d.opacity)
      .attr('border-color', d => d.borderColor)
      .attr('stroke', d => d.color);

    // Create the nodes
    this.node = this.svg.append('g')
      .selectAll('circle')
      .data(nodes)
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
    // Update the fixed positions for each node based on its type
    // nodes.forEach(node => {
    //   const [centerX, centerY] = this.getClusterCenter(node.value.type);
    //   const [x, y] = this.getRandomPositionInCircle(centerX, centerY);
    //   node.x = x;
    //   node.y = y;
    //   node.r = 2 * (node.id[1].count / node.value.total_count);
    // });

    links.forEach(link => {
      link.opacity = 1 * (link.value / link.max_value);
      link.color = d3.color('#999');
      link.strokeWidth = Math.sqrt(link.value);
    });

    this.node = this.node.data(nodes);
    this.node.exit().remove();
    this.node = this.node.enter().append('circle')
      .attr('r', d => d.r)
      .attr('fill', d=> d.color)
      .merge(this.node)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    this.link = this.link.data(links);
    this.link.exit().remove();
    this.link = this.link.enter().append('line')
      .attr('stroke-width', d => d.strokeWidth)
      .attr('stroke', d => d.color)
      .attr('opacity', d => d.opacity)
      .merge(this.link)
      .attr('x1', d => nodes.find(n => n.id === d.source).x)
      .attr('y1', d => nodes.find(n => n.id === d.source).y)
      .attr('x2', d => nodes.find(n => n.id === d.target).x)
      .attr('y2', d => nodes.find(n => n.id === d.target).y);
  }

  getClusterCenter(type) {
    // Define the center position of the cluster based on the node type
    let x, y;
    switch (type) {
      case 0:
        x = this.width / 4;
        y = this.height / 4;
        break;
      case 1:
        x = this.width / 6;
        y = this.height * 0.5;
        break;
      case 2:
        x = this.width / 2;
        y = this.height / 2;
      case 3:
        x = this.width / 2.5;
        y = this.height /2;
        break;
      case 4:
        x = this.width * 0.8;
        y = this.height * 0.5;
        break;
      case 5:
        x = this.width / 4;
        y = this.height / 2;
        break;
      case 6:
        x = (3 * this.width) / 4;
        y = this.height / 2;
        break;
      case 7:
        x = this.width  * 0.6;
        y = this.height / 2;
        break;
      case 8:
        x = this.width * 0.75;
        y = this.height / 8;
        break;
      default:
        x = this.width / 2;
        y = this.height / 2;
        break;
    }
    return [x, y];
  }

  getRandomPositionInCircle(centerX, centerY) {
    // Define a random position within a circle around the center
    const radius = Math.min(this.width, this.height) / 5;
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
    return [x, y];
  }

  showTooltip(event, d) {
    this.tooltip.html(`ID: ${d.id}<br>Type: ${d.type}`)
      .style('visibility', 'visible');
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