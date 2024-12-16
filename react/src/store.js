import { configureStore } from '@reduxjs/toolkit';
import dataSetReducer from './redux/DataSetSlice';
import streamGraphReducer from './redux/StreamGraphSlice';
import heatmapConfigReducer from './redux/HeatmapConfigSlice';
import firewallReducer  from './redux/FirewallSlice';
import histoConfigReducer from './redux/HistoConfigSlice';

const store = configureStore({
  reducer: {
    dataSet: dataSetReducer, 
    streamGraph: streamGraphReducer, 
    heatmapConfig: heatmapConfigReducer, 
    firewallDataSet: firewallReducer, 
    histoConfig: histoConfigReducer,
  },
});

export default store;
