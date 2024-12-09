import { configureStore } from '@reduxjs/toolkit';
import dataSetReducer from './redux/DataSetSlice';

const store = configureStore({
  reducer: {
    dataSet: dataSetReducer, // Register the `dataSet` slice here
  },
});

export default store;
