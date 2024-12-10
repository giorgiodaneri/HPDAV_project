import { createSlice } from '@reduxjs/toolkit'

export const configSlice = createSlice({
  name: 'config',
  initialState: {
    xAxis : "sourceIP",
    yAxis : "destIP"
  },
  reducers: {
    // store data for the heatmap axes
    generateFromConfig: (state, action) => {
      state.xAxis = action.payload.xAxis;
      state.yAxis = action.payload.yAxis;
    }
  }
})

// Action creators are generated for each case reducer function
export const { generateFromConfig} = configSlice.actions

export default configSlice.reducer