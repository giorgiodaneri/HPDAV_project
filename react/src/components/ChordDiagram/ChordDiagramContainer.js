import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ChordDiagram from './ChordDiagram';

function ChordDiagramContainer() {
  const data = useSelector((state) => state.firewallDataSet.data);
  const divContainerRef = useRef(null);
  const chordRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCharSize = () => ({
    width: divContainerRef.current.offsetWidth,
    height: divContainerRef.current.offsetHeight,
  });

  useEffect(() => {
    if (divContainerRef.current) {
      const chord = new ChordDiagram(divContainerRef.current);
      chord.create({ size: getCharSize() });
      chordRef.current = chord;
    }
  }, []);

  useEffect(() => {
    if (data && data.length > 0) {
      setIsLoading(false);
      chordRef.current.renderChordDiagram(data);
    } else {
      // If data is empty or not yet loaded
      chordRef.current && chordRef.current.clear();
    }
  }, [data]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative"}}>
      <h2>Chord Diagram</h2>
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
