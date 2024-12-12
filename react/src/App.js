import './App.css';
import { useEffect} from 'react';
import { getProjectionData } from './redux/DataSetSlice';
import { getFirewallData } from './redux/FirewallSlice';
import { useDispatch } from 'react-redux';
import StreamGraphComponent from './components/streamgraph/StreamGraphComponent';
import HeatmapContainer from './components/Heatmap/HeatmapContainer';
import HeatmapControlBar from './components/HeatmapControlBar/HeatmapControlBar';
import GraphContainer from './components/Graph/GraphContainer';

// a component is a piece of code which render a part of the user interface
function App() {
  const dispatch = useDispatch();

  useEffect(()=>{
    console.log("App useEffect")
    dispatch(getProjectionData());
  },[dispatch]) // empty dependencies [] <=> component did mount

  // useEffect(()=>{
  //   console.log("App useEffect")
  //   dispatch(getFirewallData());
  // } ,[dispatch]) // empty dependencies [] <=> component did mount

  return (
    <div className="App">
      {console.log("App rendering")}
        {/* Control Bar */}
        <div id="control-container" className="controlRow">
          <div id="control-bar-container" className="controlBar">
            <HeatmapControlBar />
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
    </div>
  );
}

export default App;
