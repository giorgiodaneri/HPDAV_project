import { configureStore } from '@reduxjs/toolkit';
import dataSetReducer from './redux/DataSetSlice';
import streamGraphReducer from './redux/StreamGraphSlice';
import firewallReducer  from './redux/FirewallSlice';
import heatmapConfigReducer from './redux/HeatmapConfigSlice';

const store = configureStore({
  reducer: {
    dataSet: dataSetReducer, // Register the `dataSet` slice here
    firewallDataSet: firewallReducer, // Register the `firewallDataSet` slice
    streamGraph: streamGraphReducer, // stream graph reducer
    heatmapConfig: heatmapConfigReducer, 

  },
});

export default store;
