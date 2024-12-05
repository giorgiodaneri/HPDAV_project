import pandas as pd
import re

# Define the file path
file_path = 'MC2-CSVFirewallandIDSlogs/IDS-0406.csv'
file_path2 = 'MC2-CSVFirewallandIDSlogs/IDS-0407.csv'

# Load the first ten rows of the CSV file
data = pd.read_csv(file_path)
data2 = pd.read_csv(file_path2)
data = pd.concat([data, data2])

# get the col names
col_names = data.columns
print("column names: ", col_names)

# create a new data frame called new_data
new_data = pd.DataFrame()

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

# process the time col so that only the day and HH:MM are shown. the date is in the M/D/YYYY HH:MM format
new_data['time'] = data['time'].apply(lambda x: ' '.join([x.split(' ')[0].split('/')[1], x.split(' ')[1]]))

# apply the map to the sourceIP column 
# new_data[' sourceIP'] = data[' sourceIP'].apply(map_ip)
new_data[' sourceIP'] = data[' sourceIP']
new_data[' sourcePort'] = data[' sourcePort']

# apply the map to the destIP column
# new_data[' destIP'] = data[' destIP'].apply(map_ip)
new_data[' destIP'] = data[' destIP']
new_data[' destPort'] = data[' destPort']

# get the unique entries in the classification col
classification = data[' classification'].unique()
# map all the unique values in the classification col to a number and add them to new_data
new_data[' classification'] = data[' classification'].apply(lambda x: classification.tolist().index(x))
# print all the unique entries in the classification col 
# create a dictionary to store the mapping between classification values and their assigned numbers
classification_mapping = {value: idx for idx, value in enumerate(classification)}
# print the classification mapping
print("classification mapping: ", classification_mapping)
print("classification: ", classification)
# write the classification mapping to a .txt file
with open('classification_mapping.txt', 'w') as f:
    for key, value in classification_mapping.items():
        f.write(f'{key}: {value}\n')

# print the relative mapping
print("classification mapping: ", new_data[' classification'].unique())


# add the priority of the packets
new_data[' priority'] = data[' priority']

# same for packet info and packet info cont'd
packet_info = data[' packet info'].unique()
packet_info_contd = data['packet info cont\'d'].unique()

# map the unique entries of ' packet info' and 'packet info cont'd' to numbers
new_data[' packet info'] = data[' packet info'].apply(lambda x: packet_info.tolist().index(x))
new_data['packet info cont\'d'] = data['packet info cont\'d'].apply(lambda x: packet_info_contd.tolist().index(x))

# do not add xref to the final dataset since it is useless
# write the dataset to a csv file
# new_data.to_csv('MC2-CSVFirewallandIDSlogs/IDS_global_filtered.csv', index=False)

## NOTE: packet info for malicious activities in empty