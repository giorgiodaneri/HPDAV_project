import { createSlice } from '@reduxjs/toolkit';

const graphSlice = createSlice({
  name: 'graph',
  initialState: {
    graphData: [],
  },
  reducers: {
    updateGraphData: (state, action) => {
      state.graphData = action.payload;
    },
  },
});

export const { updateGraphData } = graphSlice.actions;
export default graphSlice.reducer;