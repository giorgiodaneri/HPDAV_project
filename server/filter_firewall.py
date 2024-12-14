import pandas as pd
import re

# define the file path
file_path = '../MC2-CSVFirewallandIDSlogs/Firewall-04062012.csv'
file_path2 = '../MC2-CSVFirewallandIDSlogs/Firewall-04072012.csv'

# load the first ten rows of the CSV file
data = pd.read_csv(file_path)
data2 = pd.read_csv(file_path2)
data = pd.concat([data, data2])

# create a new data frame called new_data
new_data = pd.DataFrame()

# Define the mapping function based on the network description, so as to partiotion them into categories
def map_ip(ip):
    ip = str(ip)
    # Exact matches
    exact_match = {
        "10.32.0.1": 0,
        "172.23.0.1": 1,
        "10.32.0.100": 3,
        "172.25.0.1": 4,
        "10.99.99.2": 6,
        "172.23.0.10": 8,
        "172.23.0.2": 9
    }

    if ip in exact_match:
        return exact_match[ip]
    
    # Range matches
    # 10.32.0.201-210
    if re.match(r"^10\.32\.0\.(20[1-9]|21[0])$", ip):
        return 5
    
    # 10.32.1.100
    if re.match(r"^10\.32\.1\.100$", ip):
        return 5

    # 10.32.1.201-206
    if re.match(r"^10\.32\.1\.(20[1-6])$", ip):
        return 5

    # 10.32.5.1-254
    if re.match(r"^10\.32\.5\.(\d{1,2}|1\d{2}|2[0-4]\d|25[0-4])$", ip):
        return 5
    
    # 172.23.214.x through 172.23.229.x
    if re.match(r"172\.23\.(214|215|216|217|218|219|220|221|222|223|224|225|226|227|228|229)\.\d{1,3}", ip):
        return 7
    
    # 172.23.x.x excluding previously identified
    if re.match(r"172\.23\.\d{1,3}\.\d{1,3}", ip):
        return 10
    
    # (empty)
    if ip == "(empty)":
        return 11

    # If no matches, return the same IP address (unchanged)
    return ip

# the structure of the column Date/time is the following: "YYYY-MM-DD HH:MM:SS". 
# the possible values of the day are only 05 and 06, while the month and year are always the same. 
# Remove the month and year, keep the day (only the relevant digit, i.e. 5 or 6) and the time
extracted = data["Date/time"].str.extract(r"(\d{2})/.*? (\d{2}:\d{2}:\d{2})")
# apply the transformation to format the day and time
data["Date/time"] = extracted[0].astype(int).astype(str) + ' ' + extracted[1]
# add Date/time column
new_data['Date/time'] = data['Date/time']

# assign to each unique value in the Syslog priority column a number
syslog_unique_values = data['Syslog priority'].unique()
syslog_priority_mapping = {value: idx for idx, value in enumerate(syslog_unique_values)}  
new_data['Syslog priority'] = data['Syslog priority'].map(syslog_priority_mapping)

# write the syslog priority mapping to a file
with open('../MC2-CSVFirewallandIDSlogs/syslog_priority_mapping.txt', 'w') as f:
    for code, priority in syslog_priority_mapping.items():
        f.write(f"{code}: {priority}\n")

# select the Operation column and assign a value from 0 to n for each unique value
operation_unique_values = data['Operation'].unique()
operation_mapping = {value: idx for idx, value in enumerate(operation_unique_values)}  
new_data['Operation'] = data['Operation'].map(operation_mapping)

# write the operation mapping to a file
with open('../MC2-CSVFirewallandIDSlogs/operation_mapping.txt', 'w') as f:
    for code, operation in operation_mapping.items():
        f.write(f"{code}: {operation}\n")

# select the Message code and assign a number from 0 to n for each unique value
message_code_unique_values = data['Message code'].unique()
message_code_mapping = {value: idx for idx, value in enumerate(message_code_unique_values)}
new_data['Message code'] = data['Message code'].map(message_code_mapping)

# write the message code mapping to a file
with open('../MC2-CSVFirewallandIDSlogs/message_code_mapping.txt', 'w') as f:
    for code, message in message_code_mapping.items():
        f.write(f"{code}: {message}\n")

# select the Protocol and assign 0 if TCP and 1 if UDP, 2 to empty values
new_data['Protocol'] = data['Protocol'].apply(lambda x: 0 if x == 'TCP' else 1 if x == 'UDP' else 2)

# write the protocol mapping to a file
protocol_mapping = {
    "TCP": 0,
    "UDP": 1,
    "": 2
}
with open('../MC2-CSVFirewallandIDSlogs/protocol_mapping.txt', 'w') as f:
    for protocol, code in protocol_mapping.items():
        f.write(f"{protocol}: {code}\n")

# add source ip and destination ip columns
# TODO: understand if non-mapped IPs are relevant / suspect
# new_data['Source IP'] = data['Source IP'].apply(map_ip)
new_data['Source IP'] = data['Source IP']
# new_data['Destination IP'] = data['Destination IP'].apply(map_ip)
new_data['Destination IP'] = data['Destination IP']

# DO NOT add Source hostname and Destination hostname columns since they are empty

# add Source Port and Destination Port columns
# TODO: understand if there exist ports with a special semantics, invalid and suspect ones
# all the others are non relevant for visualization purposes
new_data['Source port'] = data['Source port']
new_data['Destination port'] = data['Destination port']
# select the Destination service and assign a number 0 to http, leave the rest as it is
# new_data['Destination service'] = data['Destination service'].apply(lambda x: 0 if x == 'http' else x)
new_data['Destination service'] = data['Destination service']

# select the Direction and assign 0 if the value is "inbound", 1 if the value is "outbound", 2 to empty values
new_data['Direction'] = data['Direction'].apply(lambda x: 0 if x == 'inbound' else 1 if x == 'outbound' else 2)

# write the direction mapping to a file
direction_mapping = {
    "inbound": 0,
    "outbound": 1
}
with open('../MC2-CSVFirewallandIDSlogs/direction_mapping.txt', 'w') as f:
    for direction, code in direction_mapping.items():
        f.write(f"{direction}: {code}\n")

# eliminate all the rows where protocol is equal to 2 (empty), since Source IP, Destinatio IP are empty too
new_data = new_data[new_data['Protocol'] != 2]

# print("Before http removal: ",len(new_data))
# # now remove all the rows where the Destination service is http
# new_data = new_data[new_data['Destination service'] != 'http']
# print("After http removal: ",len(new_data))
# NOTE: EVENTUALLY, THE REMOVED LOGS CAN BE PUT IN ANOTHER DATASET FOR FURTHER ANALYSIS, IF THEY TURN OUT TO BE SIGNIFICANT

# DO NOT add the Connections built / torn down since it is redundant with the Operation column
# write new_data to a new CSV file with its own index
new_data.to_csv('../MC2-CSVFirewallandIDSlogs/Firewall_global_filtered.csv', index=False)