import './App.css';
import { getFirewallData } from './redux/FirewallSlice';
import { getProjectionData } from './redux/DataSetSlice';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StreamGraphComponent from './components/Streamgraph/StreamGraphComponent';
import HeatmapContainer from './components/Heatmap/HeatmapContainer';
import ControlBar from './components/ControlBar/ControlBar';
import GraphContainer from './components/Graph/GraphContainer';
import ChordDiagramContainer from './components/ChordDiagram/ChordDiagramContainer'; // adjust path as needed
import HistogramContainer from './components/Histogram/HistogramContainer';
import HistoControlBar from './components/HistoControlBar/HistoControlBar';

function App() {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState('Page1'); 
  const firewallStatus = useSelector((state) => state.firewallDataSet.status);
  const { data, total, hasMore, error } = useSelector((state) => state.firewallDataSet);
  // variables to handle loading of paginated data
  const [page, setPage] = useState(1); 
  const pageSize = 700000; 

  useEffect(() => {
    console.log("App useEffect");
    dispatch(getProjectionData());
  }, [dispatch]); 

  useEffect(() => {
    // fetch data for the current page
    if (firewallStatus === 'idle' || firewallStatus === 'succeeded') {
      if (hasMore) {
        dispatch(getFirewallData({ page, pageSize }));
      }
    }
  }, [dispatch, page, firewallStatus, hasMore, pageSize]);

  useEffect(() => {
    // if new data has been loaded, move to the next page
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [data, hasMore]); 
  const handleMenuClick = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="App">
      {console.log("App rendering")}
      <h2>Analysis of Bank of Money's Regional Office Operations</h2>
      {/* Menu */}
      <div className="menu">
        <button className="page-button" onClick={() => handleMenuClick('Page1')}>IDS logs analysis</button>
        <button className="page-button" onClick={() => handleMenuClick('Page2')}>Firewall logs analysis</button>
      </div>
      {/* Page Content */}
      <div className="page-content">
        {currentPage === 'Page1' && (
          <>
            {/* Control Bar */}
            <div id="control-container" className="controlRow">
              <div id="control-bar-container" className="controlBar">
                <ControlBar />
              </div>
            </div>
            {/* Visualization Container */}
            <div id="row-container">
              <StreamGraphComponent />
              <HeatmapContainer />
            </div>
            <div id="graph-container">
              <GraphContainer />
            </div>
          </>
        )}
        {currentPage === 'Page2' && (
        <>
          {/* Control Bar */}
          <div id="control-container" className="controlRow">
              <div id="control-bar-container" className="controlBar">
                < HistoControlBar />
              </div>
            </div>
          {/* Chord Diagram and Histogram*/}
            <div id="histogram-container" style={{height: "600px"}}> 
              <HistogramContainer />
            </div>
            <div id="chord-container" style={{height: "1000px"}}>
              <ChordDiagramContainer />
            </div>
        </>
      )}
      </div>
    </div>
  );
}

export default App;
