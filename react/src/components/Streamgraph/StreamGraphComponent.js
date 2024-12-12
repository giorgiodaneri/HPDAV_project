import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import StreamGraphD3 from './StreamGraph-d3';
import { toggleClassification } from '../../redux/StreamGraphSlice';
import {
  getProjectionData,
  updateSelectedTimeRange,
  updateSelectedClassifications,
} from '../../redux/DataSetSlice';

const StreamGraphComponent = ({ onBrush }) => {
  const data = useSelector((state) => state.dataSet.data || []);
  const selectedClassifications = useSelector(
    (state) => state.streamGraph.selectedClassifications
  );
  const timeRange = useSelector((state) => state.heatmapConfig.timeRange); // Get time range from Redux
  const startTime = timeRange[0];
  const endTime = timeRange[1];
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

        // Set the brushed callback to update Redux state
        streamGraphRef.current.setBrushedCallback(({ range, classifications }) => {
          dispatch(updateSelectedTimeRange(range));
          dispatch(updateSelectedClassifications(classifications));
        });
      }

      // Render the graph with the filtered data and selected classifications
      streamGraphRef.current.render(data, selectedClassifications, startTime, endTime);
    }
  }, [data, selectedClassifications, startTime, endTime, dispatch]);

  // Handle checkbox changes
  const handleCheckboxChange = (classification) => {
    dispatch(toggleClassification(classification));
    // Clear the brush when a checkbox is toggled
    if (streamGraphRef.current) {
      streamGraphRef.current.clearBrush();
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
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
          <label key={index}>
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
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
};

export default StreamGraphComponent;
