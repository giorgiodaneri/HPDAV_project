import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import StreamGraphD3 from './StreamGraph-d3';
import { getProjectionData } from '../../redux/DataSetSlice';

const StreamGraphComponent = () => {
  const data = useSelector((state) => state.dataSet.data || []); // Default to empty array if undefined
  const dispatch = useDispatch();
  const svgRef = useRef();
  const streamGraphRef = useRef();

  // Fetch data if it's not already available
  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      dispatch(getProjectionData()); 
    }
  }, [data, dispatch]);

  // Initialize and update the StreamGraphD3 visualization
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      if (!streamGraphRef.current) {
        streamGraphRef.current = new StreamGraphD3(svgRef.current);
      }
      // Render the graph with current data
      try {
        streamGraphRef.current.render(data);
      } catch (error) {
        console.error('Error rendering StreamGraph:', error);
      }
    }
  }, [data]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h2>Stream Graph</h2>
      <div>You can zoom in!</div>
      {/* SVG container for the D3 visualization */}
      <svg ref={svgRef} style={{ width: '100%', height: '500px' }}></svg>
    </div>
  );
};

export default StreamGraphComponent;
