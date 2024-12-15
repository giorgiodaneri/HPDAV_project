import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import StreamGraphD3 from './StreamGraph-d3';
import {
  updateAggregationInterval,
} from '../../redux/StreamGraphSlice';
import {
  getProjectionData,
  updateSelectedTimeRange,
} from '../../redux/DataSetSlice';

const StreamGraphComponent = ({ onBrush }) => {
  const data = useSelector((state) => state.dataSet.data || []);
  const filters = useSelector((state) => state.heatmapConfig.filters);
  const aggregationInterval = useSelector(
    (state) => state.streamGraph.aggregationInterval
  );
  const timeRange = useSelector((state) => state.heatmapConfig.timeRange);
  const startTime = timeRange[0];
  const endTime = timeRange[1];
  const dispatch = useDispatch();
  const svgRef = useRef();
  const streamGraphRef = useRef();

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      dispatch(getProjectionData());
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      if (!streamGraphRef.current) {
        streamGraphRef.current = new StreamGraphD3(svgRef.current);
        // Set the brushed callback to update Redux state
        streamGraphRef.current.setBrushedCallback(({ range }) => {
          dispatch(updateSelectedTimeRange(range));
        });
      }

      // Clear the brush before rendering the graph
      streamGraphRef.current.clearBrush();

      // Render the graph with the filtered data and aggregation interval
      streamGraphRef.current.render(
        data,
        filters, 
        startTime,
        endTime,
        aggregationInterval
      );
    }
  }, [data, filters, startTime, endTime, aggregationInterval, dispatch]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && streamGraphRef.current) {
        streamGraphRef.current.clearBrush();
        dispatch(updateSelectedTimeRange([startTime, endTime]));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [startTime, endTime, dispatch]);

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
        <label htmlFor="aggregation-interval">Aggregation Interval: </label>
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

      {/* SVG container for the D3 visualization */}
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
};

export default StreamGraphComponent;
