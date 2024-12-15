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
      if (node.id === "172.23.0.10") {
        // Place node randomly within the container
        node.x = Math.random() * this.width;
        node.y = Math.random() * this.height;
        node.fx = node.x; // Fix the position
        node.fy = node.y;
      } else {
        const [x, y] = this.getClusterCenter(node.value.type);
        node.x = x;
        node.y = y;
        if (node.value.type != 2 && node.value.type != 3) {
          if(node.value.count !== 0){
            node.r = Math.min(nodeWidthConstantMap[node.value.type] * (node.value.count / node.value.total_count), 20);
            node.r = Math.max(node.r, 4);
            node.opacity = 0.8;
            node.color = d3.color(colorMap[node.value.type]);
          }
          else{
            node.r = Math.min(500 * (node.value.dns_connection / node.value.total_dns_connection), 20);
            node.r = Math.max(node.r, 4);
            node.opacity = 0.6;
            node.color = d3.color(colorMap[8]);
          }
        } else {
          node.r = 20;
          node.opacity = 0.7;
          node.color = d3.color(colorMap[node.value.type]);
        }
      }
    });

    links.forEach(link => {
      link.opacity = this.getOpacity(link.value / link.max_value);
      link.color = d3.color('#100');
      link.strokeWidth = 2;
      link.borderColor = d3.color('#000');
    });

    const simulation = d3.forceSimulation(nodes.filter(node => node.value.count !== 0)) // Exclude fixed nodes and count=0
      .force("link", d3.forceLink(links).id(d => d.id).distance(10)) // Increase link distance
      .force("charge", d3.forceManyBody().strength(d => {
        let repulsion_force = -400 * (300 * d.value.count / d.value.total_count);
        return nodes.filter(n => (n.value.type === d.value.type)).length > 1 ? repulsion_force : -100; // Higher repulsion for same type
      }))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2)) // Center the nodes
      .force("x", d3.forceX(this.width / 2).strength(0.2)) // Horizontal force towards the center
      .force("y", d3.forceY(this.height / 2).strength(0.4)) // Vertical force towards the center
      .on("tick", () => this.ticked()); // Update node and link positions
  
    // Create the links
    this.link = this.svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', d => d.strokeWidth)
      .attr('opacity', d => d.opacity)
      .attr('stroke', d => d.color)
      .attr('fill', 'none');

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
      .call(d3.drag()
        .on("start", (event, d) => this.dragstarted(event, d, simulation))
        .on("drag", (event, d) => this.dragged(event, d))
        .on("end", (event, d) => this.dragended(event, d, simulation)));

    this.updateGraph(nodes, links);
  }

  ticked() {
    this.node
      .attr('cx', d => d.x = Math.max(d.r, Math.min(this.width - d.r, d.x)))
      .attr('cy', d => d.y = Math.max(d.r, Math.min(this.height - d.r, d.y)));

    this.link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
  }

  dragstarted(event, d, simulation) {
    if (!event.active) simulation.alphaTarget(0.5).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  dragended(event, d, simulation) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
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
      .attr('x1', d => nodes.find(n => n.id === d.source.id).x)
      .attr('y1', d => nodes.find(n => n.id === d.source.id).y)
      .attr('x2', d => nodes.find(n => n.id === d.target.id).x)
      .attr('y2', d => nodes.find(n => n.id === d.target.id).y);
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
    if (x <= 0.1) {
      return 0.1;
    } else if (x <= 0.2) {
      return 0.15;
    } else if (x <= 0.3) {
      return 0.20;
    } else if (x <= 0.4) {
      return 0.25;
    } else if (x <= 0.5) {
      return 0.25;
    } else if (x <= 0.6) {
      return 0.30;
    } else if (x <= 0.7) {
      return 0.35;
    } else if (x <= 0.8) {
      return 0.5;
    } else if (x <= 0.9) {
      return 0.8;
    } else if (x <= 1) {
      return 1.0;
    } else {
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


  highlightNodesByIP(selectedCells) {
    // Reset all nodes to their original stroke and stroke-width
    this.node
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Highlight only the nodes present in selectedCells
    selectedCells.forEach(cell => {
      const sourceIP = cell.data.sourceIP;
      const targetIP = cell.data.destIP;
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