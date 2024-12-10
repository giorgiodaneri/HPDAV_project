import { configureStore } from '@reduxjs/toolkit';
import dataSetReducer from './redux/DataSetSlice';
import streamGraphReducer from './redux/StreamGraphSlice';

const store = configureStore({
  reducer: {
    dataSet: dataSetReducer, // Register the `dataSet` slice here
    streamGraph: streamGraphReducer, // stream graph reducer
  },
});

export default store;
