import pandas as pd
import re

# Define the file path
file_path = '/home/giorgio/Documents/COURSES/HPDAV/HPDAV_files_proj/MC2-CSVFirewallandIDSlogs/Firewall-04072012.csv'

# Load the first ten rows of the CSV file
data = pd.read_csv(file_path)

# create a new data frame called new_data
new_data = pd.DataFrame()

# Define the mapping function based on the network description, so as to partiotion them into categories
def map_ip(ip):
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
    # 10.32.0.201-210, 10.32.1.100, 10.32.1.201-206, 10.32.5.1-254
    if re.match(r"10\.32\.(0\.(20[1-9]|21[0]))|1\.(100)|1\.(201-206)|5\.(1-254)", ip):
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
new_data['Syslog priority'] = data['Syslog priority'].astype('category').cat.codes
syslog_priority_mapping = dict(enumerate(data['Syslog priority'].unique()))
print("\nSyslog priority mapping:")
for code, priority in syslog_priority_mapping.items():
    print(f"{priority}: {code}")

# select the Operation column and assign a value from 0 to n for each unique value
new_data['Operation'] = data['Operation'].astype('category').cat.codes
# print all the unique values of Operation and the corresponding assigned number in the new data frame
operation_mapping = dict(enumerate(data['Operation'].unique()))
print("\nOperation mapping:")
for code, operation in operation_mapping.items():
    print(f"{operation}: {code}")

# select the Message code and assign a number from 0 to n for each unique value
new_data['Message code'] = data['Message code'].astype('category').cat.codes
# print all the unique values of Message code and the corresponding assigned number in the new data frame
message_code_mapping = dict(enumerate(data['Message code'].unique()))
print("\nMessage code mapping:")
for code, message in message_code_mapping.items():
    print(f"{message}: {code}")

# select the Protocol and assign 0 if TCP and 1 if UDP, 2 to empty values
new_data['Protocol'] = data['Protocol'].apply(lambda x: 0 if x == 'TCP' else 1 if x == 'UDP' else 2)

# add source ip and destination ip columns
# TODO: understand if non-mapped IPs are relevant / suspect
new_data['Source IP'] = data['Source IP']
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

# DO NOT add the Connections built / torn down since it is redundant with the Operation column
# write new_data to a new CSV file with its own index
new_data.to_csv('Firewall_2_filtered.csv', index=False)