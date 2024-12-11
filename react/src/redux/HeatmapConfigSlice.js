import { createSlice } from '@reduxjs/toolkit'

export const heatmapConfigSlice = createSlice({
  name: 'heatmapConfig',
  initialState: {
    category: "suspect",
    timeRange: [0, 0],
  },
  reducers: {
    // store data for the heatmap axes
    generateFromConfig: (state, action) => {
      state.category = action.payload.category;
      state.timeRange = action.payload.timeRange;
    }
  }
})

// Action creators are generated for each case reducer function
export const { generateFromConfig} = heatmapConfigSlice.actions

export default heatmapConfigSlice.reducer