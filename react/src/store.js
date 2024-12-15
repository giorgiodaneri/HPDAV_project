import { configureStore } from '@reduxjs/toolkit';
import dataSetReducer from './redux/DataSetSlice';
import streamGraphReducer from './redux/StreamGraphSlice';
import heatmapConfigReducer from './redux/HeatmapConfigSlice';
import firewallReducer  from './redux/FirewallSlice';
import histoConfigReducer from './redux/HistoConfigSlice';

const store = configureStore({
  reducer: {
    dataSet: dataSetReducer, // Register the `dataSet` slice here
    streamGraph: streamGraphReducer, // stream graph reducer
    heatmapConfig: heatmapConfigReducer, 
    firewallDataSet: firewallReducer, // Register the `firewallDataSet` slice
    histoConfig: histoConfigReducer, // Register the `histo
  },
});

export default store;
