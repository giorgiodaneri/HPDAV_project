import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const getProjectionData = createAsyncThunk('projectionData/fetchData',
  async (args,thunkAPI) => {
    // Take data by calling the API -> call getDataset in the backend
    const response = await fetch('http://localhost:5000/getDataset');
    console.log("API response:", response);
    // convert the response to json
    const responseJson = await response.json();
    console.log("API response JSON:", responseJson);
    // return the data
    return responseJson;
    // when a result is returned, extraReducer below is triggered
    // with the case getProjectionData.fulfilled
  })

  export const dataSetSlice = createSlice({
      name: 'dataSet',
      initialState: [],
      reducers: { // add reducer if needed
    },
    // extraReducers are triggered when the action is dispatched
    extraReducers: builder => {
      builder
        .addCase(getProjectionData.pending, (state, action)=>{
          // Case where the action is pending
          console.log("getProjectionData pending");
        })
        .addCase(getProjectionData.fulfilled, (state, action) => {
          // Case where the action is fulfilled -> return the data to the state
          console.log("getProjectionData fulfilled");
          return action.payload
        })
        .addCase(getProjectionData.rejected, (state, action)=>{
          // Case where the action is rejected
          console.log("getProjectionData rejected", action.error.message);
        })
    }
    })

// Action creators are generated for each case reducer function
// export const { reducerName } = dataSetSlice.actions

export default dataSetSlice.reducer
