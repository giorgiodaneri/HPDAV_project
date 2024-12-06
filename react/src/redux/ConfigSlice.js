import { createSlice } from '@reduxjs/toolkit'

export const configSlice = createSlice({
  name: 'config',
  initialState: {
    distance: "euclidean",
  },
  reducers: {
    updateDistance: (state, action) => {
      return {...state, distance:action.payload.distance};
    },
  }
})

// Action creators are generated for each case reducer function
export const { updateDistance} = configSlice.actions

export default configSlice.reducer