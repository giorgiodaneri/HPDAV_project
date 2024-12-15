import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import './Histogram.css';
import Histogram from './Histogram';


function HistogramContainer() {
    // const data = useSelector((state) => state.histogramData.data);
    const data = useSelector((state) => state.firewallDataSet.data);
    const hasMore = useSelector((state) => state.firewallDataSet.hasMore);
    const timeRange = useSelector((state) => state.histoConfig.timeRange);
    const dest_services = useSelector((state) => state.histoConfig.dest_services);
    const binWidth = useSelector((state) => state.histoConfig.bin_width);
    const selectedIp = useSelector((state) => state.histoConfig.selected_ip);
    const showAllServices = useSelector((state => state.histoConfig.show_all_services));
    const startTime = timeRange[0];
    const endTime = timeRange[1];
    const divContainerRef = useRef(null);
    const histogramRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    const getCharSize = () => ({
        width: divContainerRef.current.offsetWidth,
        height: divContainerRef.current.offsetHeight
    });

    // Initialize the histogram when the component is mounted
    useEffect(() => {
        const histogram = new Histogram(divContainerRef.current);
        const size = getCharSize();
        histogram.create({ size: getCharSize() });
        histogramRef.current = histogram;

        return () => histogramRef.current.clear();
    }, []);

    // Update histogram rendering based on time range and filters
    useEffect(() => {
        if (data && startTime && endTime && dest_services && binWidth) {
            if(hasMore && hasMore === true){
                setIsLoading(true);
            }
            else {
                const histogram = histogramRef.current;
                histogram.renderHistogram(data, binWidth, startTime, endTime, dest_services, selectedIp, showAllServices);
                setIsLoading(false);
            }
        }
    }, [data, startTime, endTime, hasMore, dest_services, binWidth, selectedIp, showAllServices]);

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
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

export default HistogramContainer;