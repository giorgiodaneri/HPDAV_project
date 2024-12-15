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
  const [currentPage, setCurrentPage] = useState('Page1'); // State to track the active page
  const firewallStatus = useSelector((state) => state.firewallDataSet.status);
  const { data, total, hasMore, error } = useSelector((state) => state.firewallDataSet);
  const [page, setPage] = useState(1); // State for the current page
  const pageSize = 700000; // Number of records to fetch per page

  useEffect(() => {
    console.log("App useEffect");
    dispatch(getProjectionData());
  }, [dispatch]); // empty dependencies [] <=> component did mount

  useEffect(() => {
    // Fetch data for the current page
    if (firewallStatus === 'idle' || firewallStatus === 'succeeded') {
      if (hasMore) {
        dispatch(getFirewallData({ page, pageSize }));
      }
    }
  }, [dispatch, page, firewallStatus, hasMore, pageSize]);

  useEffect(() => {
    // If new data has been loaded, move to the next page
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [data, hasMore]); // Trigger page increment when new data is available

  // if (firewallStatus === 'loading') return <p>Loading firewall data...</p>;
  // if (firewallStatus === 'failed') return <p>Error loading firewall data: {error}</p>;

  const handleMenuClick = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="App">
      {console.log("App rendering")}
      <h2>HPDAV Project</h2>

      {/* Menu */}
      <div className="menu">

      <button onClick={() => handleMenuClick('Page1')}>Page 1</button>
        <button onClick={() => handleMenuClick('Page2')}>Page 2</button>
       
      {/* {firewallStatus === 'loading' ? (
        <p>Loading firewall data...</p>
      ) : (
        <>
          <button onClick={() => handleMenuClick('Page1')}>Page 1</button>
          <button onClick={() => handleMenuClick('Page2')}>Page 2</button>
        </>
      )} */}
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
          
          {/* Chord Diagram and Histogram in the same row */}
          <div id="visualization-row">
            <div id="chord-container">
              <ChordDiagramContainer />
            </div>
            <div id="histogram-container">
              <HistogramContainer />
            </div>
          </div>
        </>
      )}

      </div>
    </div>
  );
}

export default App;
