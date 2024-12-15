import { createSlice } from '@reduxjs/toolkit'

export const histoConfigSlice = createSlice({
  name: 'histoConfig',
  initialState: {
    timeRange: ['5 17:55', '7 08:59'],
    firewall_ips: false,
    // services of interest
    dest_services: ['http', 'ftp', 'pptp', 'ms-sql-s', 'ms-sql-m', 'ingreslock', 'netbios-ns', 'netbios-dgm', 'syslog', 'knetd', 'auth', 'wins'],
    bin_width: 10,
    selected_ip: "",
    ip_toggle: false,
    show_all_services: false
  },
  reducers: {
    updateConfig: (state, action) => {
        state.timeRange = action.payload.timeRange;
        state.firewall_ips = action.payload.firewall_ips;
        state.dest_services = action.payload.dest_services;
        state.bin_width = action.payload.bin_width;
        state.selected_ip = action.payload.selected_ip;
        state.ip_toggle = action.payload.ip_toggle;
        state.show_all_services = action.payload.show_all_services;
    }
  },
});

export const { updateConfig } = histoConfigSlice.actions;
export default histoConfigSlice.reducer