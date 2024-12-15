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
      console.log("Start time: " + startTime);
      console.log("End time: " + endTime);
      console.log("Start filtering -------------------");
      const filteredData = data.filter((d) => {
        const parseCustomDate = (input) => {
          if (input == "6 7:15"){
            console.log("Range found");
          }
          const [day, time] = input.split(" "); // Divide il giorno e l'orario
          const [hour, minute] = time.split(":"); // Divide l'orario in ore e minuti
          return new Date(`1900-01-${day.padStart(2, "0")}T${hour.padStart(2, "0")}:${minute}:00+01:00`); // Costruisce un ISO 8601
        };
        const time = parseCustomDate(d.time);
        return (time >= startTime && time <= endTime );
      });

      const nodes = new Map();
      const linksMap = {};
      let total_connection = 0;
      
      filteredData.forEach(row => {
        const sourceIP = row.sourceIP;
        const destIP = row.destIP;
        const destination = row.Destination;

        // Source,Destination,Firewall
        const addUniqueNode = (ip, type) => {
          if (!nodes.has(ip)) {
            if (destination === 4) {
              nodes.set(ip, { IP: ip, type: type, count: 1 , total_count: 0, dns_connection: 1});
            }
            else {
              nodes.set(ip, { IP: ip, type: type, count: 1 , total_count: 0, dns_connection: 0});
              total_connection += 1;
            }
          } else {
            if (destination === 4) {
              nodes.get(ip).dns_connection += 1;
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
    if (graph && selectedCells.length > 0) {
      graph.highlightNodesByIP(selectedCells);
    }
  }, [selectedCells, graph]);

  return (
    <div>
      <h2>Graph Container</h2>
      <svg ref={svgRef} style={{ width: '100%', height: '700px' }}></svg>
    </div>
  );
};

export default GraphContainer;