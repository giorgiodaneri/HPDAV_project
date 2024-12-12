import './Heatmap.css';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import Heatmap from './Heatmap';

function HeatmapContainer() {
    const data = useSelector((state) => state.dataSet.data);
    const timeRange = useSelector((state) => state.heatmapConfig.timeRange);
    const filters = useSelector((state) => state.heatmapConfig.filters); // Updated to use filters vector

    const startTime = timeRange[0];
    const endTime = timeRange[1];
    const divContainerRef = useRef(null);
    const HeatmapRef = useRef(null);
    const [timeSlice, setTimeSlice] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);

    const getCharSize = () => ({
        width: divContainerRef.current.offsetWidth,
        height: divContainerRef.current.offsetHeight,
    });

    // Initialize the heatmap when the component is mounted
    useEffect(() => {
        const heatmap = new Heatmap(divContainerRef.current);
        heatmap.create({ size: getCharSize() });
        HeatmapRef.current = heatmap;

        return () => HeatmapRef.current.clear();
    }, []);

    // Extract unique time slices and render the initial heatmap
    useEffect(() => {
        if (data) {
            const uniqueTimes = Array.from(new Set(data.map((d) => d.time))).sort();
            setTimeSlice(uniqueTimes[0]);
            setIsLoading(false);

            const heatmap = HeatmapRef.current;
            heatmap.renderHeatmap(data, uniqueTimes[0], null, filters);
        } else {
            console.log("HeatmapContainer data is null");
        }
    }, [data, filters]);

    // Update heatmap rendering based on time range and filters
    useEffect(() => {
        if (data && startTime && endTime && filters) {
            const heatmap = HeatmapRef.current;
            heatmap.renderHeatmap(data, startTime, endTime, filters);
            setIsLoading(false);
        }
    }, [data, startTime, endTime, filters]);

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2>HeatMap</h2>
            <div style={{ width: '100%', height: '100%' }} ref={divContainerRef}></div>
            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Loading data...</p>
                </div>
            )}
        </div>
    );
}

export default HeatmapContainer;
