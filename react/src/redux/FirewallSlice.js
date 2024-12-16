import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// thunk for fetching a page of the firewall dataset
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
    data: [], 
    selectedTimeRange: null, 
    selectedClassifications: [], 
    status: 'idle',
    error: null,
    total: 0, 
    page: 0, 
    pageSize: 100, 
    hasMore: true, 
  },
  reducers: {
    updateSelectedTimeRange: (state, action) => {
      state.selectedTimeRange = action.payload; 
    },
    updateSelectedClassifications: (state, action) => {
      state.selectedClassifications = action.payload; 
    },
    resetFirewallData: (state) => {
      state.data = []; 
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
        state.data = [...state.data, ...data]; 
        state.page = page; 
        state.total = total;
        state.hasMore = state.data.length < total; 
        state.status = 'succeeded';
      })
      .addCase(getFirewallData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { updateSelectedTimeRange, updateSelectedClassifications, resetFirewallData } = firewallSlice.actions;

export default firewallSlice.reducer;
