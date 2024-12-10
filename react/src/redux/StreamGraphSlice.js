import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedClassifications: [0, 1, 2, 3, 4], // All classifications selected by default
};

const streamGraphSlice = createSlice({
  name: 'streamGraph',
  initialState,
  reducers: {
    toggleClassification(state, action) {
      const classification = action.payload;
      if (state.selectedClassifications.includes(classification)) {
        state.selectedClassifications = state.selectedClassifications.filter(
          (c) => c !== classification
        );
      } else {
        state.selectedClassifications.push(classification);
      }
    },
    resetClassifications(state) {
      state.selectedClassifications = [...initialState.selectedClassifications]; // Reset to default
    },
  },
});

export const { toggleClassification, resetClassifications } = streamGraphSlice.actions;

export default streamGraphSlice.reducer;
