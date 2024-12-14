import './App.css';
import { useEffect, useState } from 'react';
import { getProjectionData } from './redux/DataSetSlice';
import { useDispatch } from 'react-redux';
import StreamGraphComponent from './components/Streamgraph/StreamGraphComponent';
import HeatmapContainer from './components/Heatmap/HeatmapContainer';
import ControlBar from './components/ControlBar/ControlBar';
import GraphContainer from './components/Graph/GraphContainer';
import ChordDiagramContainer from './components/ChordDiagram/ChordDiagramContainer'; // adjust path as needed


function App() {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState('Page1'); // State to track the active page

  useEffect(() => {
    console.log("App useEffect");
    dispatch(getProjectionData());
  }, [dispatch]); // empty dependencies [] <=> component did mount

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
      </div>

      {/* Page Content */}
      <div className="page-content">
        {currentPage === 'Page1' && (
          <>
            <h3>Page 1</h3>
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
            <h3>Page 2</h3>
            <p>Welcome to Page 2! Add your content here.</p>
            {/* Chord Diagram */}
            <div id="chord-container" style={{ width: '100%', height: '800px' }}>
              <ChordDiagramContainer />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
