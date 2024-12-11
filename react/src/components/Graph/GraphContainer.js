import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateGraphData } from '../../redux/GraphSlice';
import GraphD3 from './Graph-D3';
import IPmap from './IPMaps';


const GraphContainer = () => {
  const dispatch = useDispatch();
  const brushedRange = useSelector((state) => state.dataSet.selectedTimeRange);
  const data = useSelector((state) => state.dataSet.data || []);
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
        return time >= startTime && time <= endTime;
      });

      const nodes = new Set();
      const linksMap = {};

      filteredData.forEach(row => {
        const sourceIP = row.sourceIP;
        const destIP = row.destIP;
        const firewall = IPmap[row.Firewall];
        // Source,Destination,Firewall
        const tmpNode_source = {IP: sourceIP, type:row.Source};
        const tmpNode_destination = {IP: destIP, type:row.Destination};
        if (firewall != "Unknown") {
          const tmpNode_firewall = {IP: firewall, type:row.Firewall};
          nodes.add(tmpNode_firewall);
        }
        nodes.add(tmpNode_source);
        nodes.add(tmpNode_destination);
        
        const addOrUpdateLink = (source, target) => {
          const key = `${source}-${target}`;
          if (linksMap[key]) {
            linksMap[key].value += 1;
          } else {
            linksMap[key] = { source, target, value: 1 };
          }
        };

        // Aggiungi i collegamenti con pesi
        if (firewall != 9) {
          addOrUpdateLink(sourceIP, firewall);
          addOrUpdateLink(firewall, destIP);
        } else {
          addOrUpdateLink(sourceIP, destIP);
        }
      });

      // Converti il set di nodi in un array
      const nodesArray = Array.from(nodes).map(id => ({ id }));

      // Converti linksMap in un array
      const linksArray = Object.values(linksMap);

      const newGraph = new GraphD3(svgRef.current);
      newGraph.initializeGraph(nodesArray, linksArray);
      setGraph(newGraph);


      dispatch(updateGraphData(data));
    }
  }, [brushedRange, data, dispatch]);

  return (
    <div>
      <h2>Graph Container</h2>
      <svg ref={svgRef} style={{ width: '100%', height: '700px' }}></svg>
    </div>
  );
};

export default GraphContainer;