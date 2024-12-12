import { createSlice } from '@reduxjs/toolkit'

export const heatmapConfigSlice = createSlice({
  name: 'heatmapConfig',
  initialState: {
    filters: [0, 1, 2, 3, 4],
    timeRange: ['5 17:55', '7 08:59'],
  },
  reducers: {
    // store data for the heatmap axes
    generateFromConfig: (state, action) => {
      state.filters = action.payload.filters;
      state.timeRange = action.payload.timeRange;
    }
  }
})

// Action creators are generated for each case reducer function
export const { generateFromConfig} = heatmapConfigSlice.actions

export default heatmapConfigSlice.reducer