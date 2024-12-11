import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const getFirewallData = createAsyncThunk('projectionData/fetchData', async () => {
  const response = await fetch('http://localhost:5000/getFirewallDataset');
  const responseJson = await response.json();
  if (!responseJson.dataset) {
    throw new Error('Dataset is missing in the API response');
  }
  return responseJson;
});

export const firewallSlice = createSlice({
  name: 'firewallDataSet',
  initialState: {
    data: [], // Ensure `data` is initialized as an empty array
    selectedTimeRange: null, // Selected time range from the brush
    selectedClassifications: [], // Selected classifications within the range
    status: 'idle',
    error: null,
  },
  reducers: {
    updateSelectedTimeRange: (state, action) => {
      state.selectedTimeRange = action.payload; // Store selected time range in the streamgraph
    },
    updateSelectedClassifications: (state, action) => {
      state.selectedClassifications = action.payload; // Store classifications within the range of streamgraph
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFirewallData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getFirewallData.fulfilled, (state, action) => {
        if (action.payload && action.payload.dataset) {
          state.data = JSON.parse(action.payload.dataset); // Ensure correct parsing
          state.status = 'succeeded';
          // print the first element of the dataset to the console
        } else {
          state.data = []; // If no dataset, ensure `data` is set to an empty array
          state.status = 'failed';
        }
      })
      .addCase(getFirewallData.rejected, (state, action) => {
        state.data = []; // Reset `data` to an empty array on error
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { updateSelectedTimeRange, updateSelectedClassifications } = firewallSlice.actions;

export default firewallSlice.reducer;
