import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateGraphData } from '../../redux/GraphSlice';
import GraphD3 from './Graph-D3';
import IPmap from './IPMaps';
import { addSelectedCell } from '../../redux/HeatmapConfigSlice';


const GraphContainer = () => {
  const dispatch = useDispatch();
  const brushedRange = useSelector((state) => state.dataSet.selectedTimeRange);
  const data = useSelector((state) => state.dataSet.data || []);
  const selectedCells = useSelector((state) => state.heatmapConfig.selectedCells);
  const svgRef = useRef();
  const [graph, setGraph] = useState(null);

  useEffect(() => {
    if (brushedRange && data.length > 0) {
      const [startTime, endTime] = brushedRange.map((time) => new Date(time));
      const filteredData = data.filter((d) => {
        const parseCustomDate = (input) => {
          const [day, time] = input.split(" "); 
          const [hour, minute] = time.split(":"); 
          return new Date(`1900-01-${day.padStart(2, "0")}T${hour.padStart(2, "0")}:${minute}:00+01:00`); // Costruisce un ISO 8601
        };
        const time = parseCustomDate(d.time);
        return (time >= startTime && time <= endTime );
      });

      const nodes = new Map();
      const linksMap = {};
      let total_connection = 0;
      let total_dns_connection = 0;
      
      filteredData.forEach(row => {
        const sourceIP = row.sourceIP;
        const destIP = row.destIP;
        const destination = row.Destination;

        // Source,Destination,Firewall
        const addUniqueNode = (ip, type) => {
          if (!nodes.has(ip)) {
            if (destination === 4) {
              nodes.set(ip, { IP: ip, type: type, count: 0 , total_count: 0, dns_connection: 1, total_dns_connection: 0});
              total_dns_connection += 1;
            }
            else {
              nodes.set(ip, { IP: ip, type: type, count: 1 , total_count: 0, dns_connection: 0, total_dns_connection: 0});
              total_connection += 1;
            }
          } else {
            if (destination === 4) {
              nodes.get(ip).dns_connection += 1;
              total_dns_connection += 1;
              // nodes.get(ip).count += 1;
            }
            else{
              total_connection += 1;
              nodes.get(ip).count += 1;
            }
          }
        };

        // Add source and destination nodes
        addUniqueNode(sourceIP, row.Source);
        if (destination !== 4)
          addUniqueNode(destIP, row.Destination);
        
        
        nodes.forEach((node) => {
          node.total_count = total_connection;
          node.total_dns_connection = total_dns_connection;
        });

        const addOrUpdateLink = (source, target) => {
          if (target != "172.23.0.10") {
            const key = `${source}-${target}`;
            if (linksMap[key]) {
              linksMap[key].value += 1;
            } else {
              linksMap[key] = { source: source, target: target, value: 1 , max_value: 0};
            }
          }
        };
        addOrUpdateLink(sourceIP, destIP);

      });

      const nodesArray = Array.from(nodes, ([id, value]) => ({ id, value }));
      const linksArray = Object.values(linksMap);

      let max_value = -1;
      linksArray.forEach(link => {
        if (link.value > max_value) {
          max_value = link.value;
        }
      });
      linksArray.forEach(link => {
        link.max_value = max_value;
      });
      const newGraph = new GraphD3(svgRef.current);
      newGraph.initializeGraph(nodesArray, linksArray);
      setGraph(newGraph);
      
      dispatch(updateGraphData(data));
    }
  }, [brushedRange, data, dispatch]);

  useEffect(() => {
    if (graph) {
      graph.highlightNodesByIP(selectedCells);
    }
  }, [selectedCells, graph]);


  return (
    <div>
      <h2>Network Visualization</h2>
      <div style={{ marginTop: '10px', fontSize: '16px', display: 'flex', justifyContent: 'center' }}>
        <p style={{ marginRight: '20px' }}><span style={{ color: '#7f7f7f', fontSize: '24px' }}>●</span> Workstations</p>
        <p style={{ marginRight: '20px' }}><span style={{ color: '#ff7f0e', fontSize: '24px'}}>●</span> Websites</p>
        <p style={{ marginRight: '20px' }}><span style={{ color: '#bcbd22', fontSize: '24px' }}>●</span> Nodes connected with DNS</p>
        <p style={{ marginRight: '20px' }}><span style={{ color: '#FF0000', fontSize: '24px' }}>●</span> Firewall</p>
      
      </div>
      <svg ref={svgRef} style={{ width: '100%', height: '700px' }}></svg>
    </div>
  );
};

export default GraphContainer;