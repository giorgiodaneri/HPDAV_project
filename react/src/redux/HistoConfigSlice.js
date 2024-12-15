import { createSlice } from '@reduxjs/toolkit'

export const histoConfigSlice = createSlice({
  name: 'histoConfig',
  initialState: {
    timeRange: ['5 17:55', '7 08:59'],
    firewall_ips: false,
    dest_services: []
  },
  reducers: {
    updateConfig: (state, action) => {
        state.timeRange = action.payload.timeRange;
        state.firewall_ips = action.payload.firewall_ips;
        state.dest_services = action.payload.dest_services;
    }
  },
});

export const { updateConfig } = histoConfigSlice.actions;
export default histoConfigSlice.reducer