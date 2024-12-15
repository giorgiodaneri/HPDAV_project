import pandas as pd

# FIREWALL LOGS
data = pd.read_csv('../MC2-CSVFirewallandIDSlogs/Firewall_global_filtered.csv')
data_temp = data[data['Destination service'] == 'http']
# get all those that have a syslog priority of 0
data_temp = data_temp[data_temp['Syslog priority'] == 0]
# sample the data by keeping 1 every 10 values
data_temp_sampled = data_temp.iloc[::20, :]
data_tcp = data[data['Destination service'] == '6667_tcp']
data_tcp_sampled = data_tcp.iloc[::10, :]
# manually add the rows where the Source IP is 10.32.5.58
row = data[data['Source IP'] == '10.32.5.58']
data_temp_sampled = pd.concat([data_temp_sampled, row])
data_temp_sampled = pd.concat([data_temp_sampled, data_tcp_sampled])
# add all the rows where the Destinatio service is not http
data_temp_sampled = pd.concat([data_temp_sampled, data[data['Destination service'].isin(['6667_tcp', 'http']) == False]])
# add a key column so that each row has a unique identifier
data_temp_sampled['key'] = range(1, len(data_temp_sampled) + 1)
# change name to the columns for better access
data_temp_sampled.rename(columns={'Date/time': 'time'}, inplace=True)
data_temp_sampled.rename(columns={'Syslog priority': 'syslog_priority'}, inplace=True)
data_temp_sampled.rename(columns={'Operation': 'operation'}, inplace=True)
data_temp_sampled.rename(columns={'Message code': 'message_code'}, inplace=True)
data_temp_sampled.rename(columns={'Source IP': 'sourceip'}, inplace=True)
data_temp_sampled.rename(columns={'Destination IP': 'destip'}, inplace=True)
data_temp_sampled.rename(columns={'Destination service': 'dest_service'}, inplace=True)
data_temp_sampled.rename(columns={'Date/time': 'time'}, inplace=True)
data_temp_sampled.rename(columns={'Destination port': 'dest_port'}, inplace=True)
data_temp_sampled.rename(columns={'Source port': 'source_port'}, inplace=True)
data_temp_sampled.rename(columns={'Protocol': 'protocol'}, inplace=True)
# write to a new csv file
data_temp_sampled.to_csv('../MC2-CSVFirewallandIDSlogs/Firewall_global_sampled.csv', index=False)