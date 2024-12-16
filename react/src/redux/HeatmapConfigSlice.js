import { createSlice } from '@reduxjs/toolkit'

export const heatmapConfigSlice = createSlice({
  name: 'heatmapConfig',
  initialState: {
    filters: [0, 1, 2, 3, 4],
    timeRange: ['5 17:55', '7 08:59'],
    selectedCells: [],
  },
  reducers: {
    generateFromConfig: (state, action) => {
      state.filters = action.payload.filters;
      state.timeRange = action.payload.timeRange;
    },
    addSelectedCell: (state, action) => {
      // avoid duplicate selections
      if (!state.selectedCells.some(cell => cell.x === action.payload.x && cell.y === action.payload.y)) {
        state.selectedCells.push(action.payload);
      }
    },
    clearSelectedCells: (state) => {
      state.selectedCells = [];
    },
  },
});

export const { generateFromConfig, addSelectedCell, clearSelectedCells } = heatmapConfigSlice.actions;
export default heatmapConfigSlice.reducer