import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const getProjectionData = createAsyncThunk('projectionData/fetchData', async () => {
  const response = await fetch('http://localhost:5000/getDataset');
  const responseJson = await response.json();
  if (!responseJson.dataset) {
    throw new Error('Dataset is missing in the API response');
  }
  return responseJson;
});

export const dataSetSlice = createSlice({
  name: 'dataSet',
  initialState: {
    data: [], 
    selectedTimeRange: null, 
    selectedClassifications: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    updateSelectedTimeRange: (state, action) => {
      state.selectedTimeRange = action.payload; 
    },
    updateSelectedClassifications: (state, action) => {
      state.selectedClassifications = action.payload; 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProjectionData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getProjectionData.fulfilled, (state, action) => {
        if (action.payload && action.payload.dataset) {
          state.data = JSON.parse(action.payload.dataset); 
          state.status = 'succeeded';
        } else {
          state.data = []; 
          state.status = 'failed';
        }
      })
      .addCase(getProjectionData.rejected, (state, action) => {
        state.data = []; 
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { updateSelectedTimeRange, updateSelectedClassifications } = dataSetSlice.actions;

export default dataSetSlice.reducer;
