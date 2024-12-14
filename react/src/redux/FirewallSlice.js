// Firewall slice is mostly fine. Below is the same, no changes are required.
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Thunk for fetching a page of the firewall dataset
export const getFirewallData = createAsyncThunk(
  'firewallData/fetchData',
  async ({ page = 1, pageSize = 10000 } = {}, { getState }) => {
    const response = await fetch(`http://localhost:5000/getFirewallDataset?page=${page}&page_size=${pageSize}`);
    const responseJson = await response.json();

    if (!responseJson.datasetFirewall) {
      throw new Error('Firewall dataset is missing in the API response');
    }

    return {
      data: responseJson.datasetFirewall,
      page,
      total: responseJson.total,
    };
  }
);

export const firewallSlice = createSlice({
  name: 'firewallDataSet',
  initialState: {
    data: [], // Store accumulated data here
    selectedTimeRange: null, // Selected time range from the brush
    selectedClassifications: [], // Selected classifications within the range
    status: 'idle',
    error: null,
    total: 0, // Total number of records available on the server
    page: 0, // Current page
    pageSize: 100, // Default page size
    hasMore: true, // Whether more data is available
  },
  reducers: {
    updateSelectedTimeRange: (state, action) => {
      state.selectedTimeRange = action.payload; // Store selected time range in the streamgraph
    },
    updateSelectedClassifications: (state, action) => {
      state.selectedClassifications = action.payload; // Store classifications within the range of streamgraph
    },
    resetFirewallData: (state) => {
      state.data = []; // Clear data when resetting
      state.page = 0;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFirewallData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getFirewallData.fulfilled, (state, action) => {
        const { data, page, total } = action.payload;

        state.data = [...state.data, ...data]; // Append the new data to the existing dataset
        state.page = page; // Update the current page
        state.total = total; // Update the total count of records
        state.hasMore = state.data.length < total; // Determine if there's more data to fetch
        state.status = 'succeeded';

        if(state.data.length > 0) {
          console.log(JSON.parse(JSON.stringify(state.data[0])));
        }
      })
      .addCase(getFirewallData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { updateSelectedTimeRange, updateSelectedClassifications, resetFirewallData } = firewallSlice.actions;

export default firewallSlice.reducer;
