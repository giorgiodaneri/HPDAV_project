import './App.css';
import { useEffect} from 'react';
import { getProjectionData } from './redux/DataSetSlice';
import { useDispatch } from 'react-redux';
import StreamGraphComponent from './components/streamgraph/StreamGraphComponent';
// here import other dependencies
import HeatmapContainer from './components/Heatmap/HeatmapContainer';

// a component is a piece of code which render a part of the user interface
function App() {
  const dispatch = useDispatch();

  useEffect(()=>{
    console.log("App useEffect")
    dispatch(getProjectionData());
  },[dispatch]) // empty dependencies [] <=> component did mount

  return (
    <div className="App">
      {console.log("App rendering")}
      <div id="view-container" className="row">
        <StreamGraphComponent />
      </div>
    </div>
  );
}

export default App;
