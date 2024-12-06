import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {getProjectionData} from "../redux/DataSetSlice";
import {useStableQueryArgs} from "@reduxjs/toolkit/src/query/react/useSerializedStableValue";


// Calling API in asyncThunk. for more details see https://redux-toolkit.js.org/api/createAsyncThunk
export const getSomething = createAsyncThunk('apiName/asyncThunkName', async (args, thunkAPI) => {
  // do something with parameters if needed
  const params=new URLSearchParams(args).toString();
  const response = await fetch('https://url.lu/getSomething?'+params);
  const responseJson = await response.json();
  // transform JSON data if needed
  // call dispatch if needed: thunkAPI.dispatch(...);
  return responseJson;
  // when a result is returned, extraReducer is triggered with the case getSomething.fulfilled (see below)
})

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
  reducers: {
    updateAnObject: (state, action) => {
      return {...state, value: state.value + action.payload}
    },
    addValueToAnArray: (state, action) => {
      return [...state, action.payload]
    },
    updateAnArray: state => {
      return state.map(item=>{
        if (itemData.index === action.payload.index) {
          return {...itemData, keyToUpdate: action.payload.valueToUpdate};
        } else {
          return itemData;
        }
      })
    },
  },
  extraReducers: builder => {
    builder.addCase(getSomething.fulfilled, (state, action) => {
      return action.payload
    })
  }
})

// Action creators are generated for each case reducer function
export const { updateAnObject, addValueToAnArray, updateAnArray } = counterSlice.actions

export default counterSlice.reducer