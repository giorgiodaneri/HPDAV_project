import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ChordDiagram from './ChordDiagram';

function ChordDiagramContainer() {
    const data = useSelector((state) => state.firewallDataSet.data);
    const timeRange = useSelector((state) => state.histoConfig.timeRange);
    const dest_services = useSelector((state) => state.histoConfig.dest_services);
    const displayFirewall = useSelector((state) => state.histoConfig.firewall_ips);

    const startTime = timeRange[0];
    const endTime = timeRange[1];
    const divContainerRef = useRef(null);
    const chordRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [topIPsCount, setTopIPsCount] = useState(30); 

    const getCharSize = () => ({
        width: divContainerRef.current.offsetWidth,
        height: divContainerRef.current.offsetHeight,
    });

    // Initialize the chord diagram
    useEffect(() => {
        const chord = new ChordDiagram(divContainerRef.current);
        chord.create({ size: getCharSize() });
        chordRef.current = chord;

        return () => chordRef.current.clear();
    }, []);

    // Render the chord diagram based on filters
    useEffect(() => {
        if (data && timeRange && dest_services) {
            const chord = chordRef.current;
            if (data.length > 0) {
                chord.renderChordDiagram(data, startTime, endTime, displayFirewall, dest_services, topIPsCount);
                setIsLoading(false);
            } else {
                chord.clear();
                setIsLoading(true);
            }
        }
    }, [data, startTime, endTime, dest_services, displayFirewall, topIPsCount]);

    const handleTopIPsChange = (event) => {
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value) && value > 0) {
            setTopIPsCount(value);
        }
    };

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <h2>Chord Diagram</h2>
            <div style={{ marginBottom: '10px' }}>
                <label htmlFor="topIPsCount">Number of Top IPs: </label>
                <input
                    type="number"
                    id="topIPsCount"
                    value={topIPsCount}
                    onChange={handleTopIPsChange}
                    min="1"
                    style={{ width: '50px' }}
                />
            </div>
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

export default ChordDiagramContainer;
