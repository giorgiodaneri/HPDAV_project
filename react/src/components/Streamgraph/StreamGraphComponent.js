import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import StreamGraphD3 from './StreamGraph-d3';
import * as d3 from 'd3';
import {
  toggleClassification,
  updateAggregationInterval,
} from '../../redux/StreamGraphSlice';
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
  const aggregationInterval = useSelector(
    (state) => state.streamGraph.aggregationInterval
  ); // Get aggregation interval from Redux
  const timeRange = useSelector((state) => state.heatmapConfig.timeRange);
  const startTime = timeRange[0];
  const endTime = timeRange[1];
  const dispatch = useDispatch();
  const svgRef = useRef();
  const streamGraphRef = useRef();

  const classificationColors = d3.schemeCategory10; // Use D3's color scheme

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

      // Render the graph with the filtered data, selected classifications, and aggregation interval
      streamGraphRef.current.render(
        data,
        selectedClassifications,
        startTime,
        endTime,
        aggregationInterval
      );
    }
  }, [data, selectedClassifications, startTime, endTime, aggregationInterval, dispatch]);

  // Handle checkbox changes
  const handleCheckboxChange = (classification) => {
    dispatch(toggleClassification(classification));
    // Clear the brush when a checkbox is toggled
    if (streamGraphRef.current) {
      streamGraphRef.current.clearBrush();
    }
  };

  // Handle aggregation interval change
  const handleAggregationChange = (event) => {
    const newInterval = parseInt(event.target.value, 10);
    dispatch(updateAggregationInterval(newInterval));
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

      {/* Dropdown for aggregation interval */}
      <div>
        <label htmlFor="aggregation-interval">Aggregation Interval:   </label>
        <select
          id="aggregation-interval"
          value={aggregationInterval}
          onChange={handleAggregationChange}
        >
          <option value={1}>1 Minute</option>
          <option value={5}>5 Minutes</option>
          <option value={10}>10 Minutes</option>
          <option value={15}>15 Minutes</option>
          <option value={60}>60 Minutes</option>
        </select>
      </div>

      {/* Checkboxes for classifications */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap', // Allow wrapping
          justifyContent: 'flex-start', // Align items to the left
          paddingTop: '10px', // Add padding around the checkboxes
          width: '100%', // Ensure full width is used
        }}
      >
        {[
          'Generic Protocol Command Decode',
          'Potential Corporate Privacy Violation',
          'Misc activity',
          'Attempted Information Leak',
          'Potentially Bad Traffic',
        ].map((label, index) => (
          <label
            key={index}
            style={{
              color: classificationColors[index], // Dynamically set text color
              marginRight: '20px', // Add spacing between labels
              cursor: 'pointer', // Make it clear the label is interactive
            }}
          >
            <input
              type="checkbox"
              checked={selectedClassifications.includes(index)}
              onChange={() => handleCheckboxChange(index)}
              style={{ marginRight: '5px' }} // Add spacing between checkbox and label
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
