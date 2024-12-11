import './Heatmap.css';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Heatmap from './Heatmap';

function HeatmapContainer() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.dataSet.data);

    const divContainerRef = useRef(null);
    const HeatmapRef = useRef(null);
    const [timeSlice, setTimeSlice] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);

    const getCharSize = () => ({
        width: divContainerRef.current.offsetWidth,
        height: divContainerRef.current.offsetHeight,
    });

    // Create the scatterplotD3 when the component is mounted
    useEffect(() => {
        const heatmap = new Heatmap(divContainerRef.current);
        heatmap.create({ size: getCharSize() });
        HeatmapRef.current = heatmap;

        return () => HeatmapRef.current.clear();
    }, []);

    useEffect(() => {
        // print the first element of the data
        if(data) {
            // Extract unique time slices
            const uniqueTimes = Array.from(new Set(data.map(d => d.time))).sort();
            setTimeSlice(uniqueTimes[0]); // Initialize with the first time slice
            setIsLoading(false);

            const heatmap = HeatmapRef.current;
            heatmap.renderHeatmap(data, uniqueTimes[0]);
        }
        else {
            console.log("HeatmapContainer data is null")
        }
    }, [data])

    useEffect(() => {
        if (timeSlice && data) {
            const heatmap = HeatmapRef.current;
            heatmap.renderHeatmap(data, timeSlice, 0);
        }
    }, [timeSlice]);

    return (
        <div
            ref={divContainerRef}
            className="heatmapDivContainer"
            style={{ width: '100%', height: '100%', position: 'relative' }}
        >
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