import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedClassifications: [0, 1, 2, 3, 4], // All classifications selected by default
  aggregationInterval: 5, // Default aggregation interval (in minutes)
  generateTrigger: false, // Add trigger for updating the StreamGraph
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
    updateAggregationInterval(state, action) {
      state.aggregationInterval = action.payload; // Update the aggregation interval
    },
    triggerGenerate(state) {
      state.generateTrigger = !state.generateTrigger; // Toggle the trigger to notify updates
    },
  },
});

export const {
  toggleClassification,
  resetClassifications,
  updateAggregationInterval,
  triggerGenerate,
} = streamGraphSlice.actions;

export default streamGraphSlice.reducer;
