import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import StreamGraphD3 from './StreamGraph-d3';
import { getProjectionData } from '../../redux/DataSetSlice';
import { toggleClassification } from '../../redux/StreamGraphSlice';

const StreamGraphComponent = () => {
  const data = useSelector((state) => state.dataSet.data || []);
  const selectedClassifications = useSelector(
    (state) => state.streamGraph.selectedClassifications
  );
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
      // Render the graph with current data and selected classifications
      try {
        streamGraphRef.current.render(data, selectedClassifications);
      } catch (error) {
        console.error('Error rendering StreamGraph:', error);
      }
    }
  }, [data, selectedClassifications]);

  // Handle checkbox changes
  const handleCheckboxChange = (classification) => {
    dispatch(toggleClassification(classification));
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h2>Stream Graph</h2>
      <div>You can zoom in!</div>

      {/* Checkboxes for classifications */}
      <div>
        {[
          'Generic Protocol Command Decode',
          'Potential Corporate Privacy Violation',
          'Misc activity',
          'Attempted Information Leak',
          'Potentially Bad Traffic',
        ].map((label, index) => (
          <label key={index} style={{ marginRight: '15px' }}>
            <input
              type="checkbox"
              checked={selectedClassifications.includes(index)}
              onChange={() => handleCheckboxChange(index)}
            />
            {label}
          </label>
        ))}
      </div>

      {/* SVG container for the D3 visualization */}
      <svg ref={svgRef} style={{ width: '100%', height: '500px' }}></svg>
    </div>
  );
};

export default StreamGraphComponent;
