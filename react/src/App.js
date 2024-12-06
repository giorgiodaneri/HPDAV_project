import './App.css';
import { useEffect} from 'react';
import { getProjectionData } from './redux/DataSetSlice';
import { useDispatch } from 'react-redux';
// here import other dependencies

// a component is a piece of code which render a part of the user interface
function App() {
  const dispatch = useDispatch();

  useEffect(()=>{
    dispatch(getProjectionData());
  },[]) // empty dependencies [] <=> component did mount

  return (
    <div className="App">
      {console.log("App rendering")}
      <div id="view-container" className="row">
        <ScatterplotContainer/>
      </div>
    </div>
  );
}

export default App;
