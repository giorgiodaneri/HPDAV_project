import * as d3 from 'd3';

class GraphD3 {
  constructor(svgElement) {
    this.svgElement = svgElement;
    this.svg = d3.select(svgElement);
    this.width = svgElement.clientWidth;
    this.height = svgElement.clientHeight;
  }

  initializeGraph(nodes) {
    this.svg.selectAll('*').remove(); // Clear previous graph

    // Define the fixed positions for each node based on its type
    nodes.forEach(node => {
      const [centerX, centerY] = this.getClusterCenter(node.type);
      const [x, y] = this.getRandomPositionInCircle(centerX, centerY);
      node.x = x;
      node.y = y;
    });

    // Create the nodes
    this.node = this.svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', 2)
      .attr('fill', 'blue')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  }

  updateGraph(nodes) {
    // Update the fixed positions for each node based on its type
    nodes.forEach(node => {
      const [centerX, centerY] = this.getClusterCenter(node.type);
      const [x, y] = this.getRandomPositionInCircle(centerX, centerY);
      node.x = x;
      node.y = y;
    });

    this.node = this.node.data(nodes);
    this.node.exit().remove();
    this.node = this.node.enter().append('circle')
      .attr('r', 2)
      .attr('fill', 'blue')
      .merge(this.node)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
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
        x = this.width / 4;
        y = this.height * 0.75;
        break;
      case 2:
        x = this.width / 2;
        y = this.height / 2;
      case 3:
        x = this.width / 2;
        y = this.height * 0.70;
        break;
      case 4:
        x = this.width / 0.75;
        y = this.height / 2;
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
        x = this.width * 0.75;
        y = this.height * 0.75;
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
}

export default GraphD3;