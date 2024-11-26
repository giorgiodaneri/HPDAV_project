import pandas as pd

# Define the file path
file_path = 'MC2-CSVFirewallandIDSlogs/Firewall-04062012.csv'

# Load the first ten rows of the CSV file
data = pd.read_csv(file_path)

# create a new data frame called new_data
new_data = pd.DataFrame()

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
# TODO: understand if how to aggregate these values, e.g. based on the prefix / host address bits
new_data['Source IP'] = data['Source IP']
new_data['Destination IP'] = data['Destination IP']

# DO NOT add Source hostname and Destination hostname columns

# add Source Port and Destination Port columns
# TODO: understand if there exist ports with a special semantics, invalid and suspect ones
# all the others are non relevant for visualization purposes
new_data['Source port'] = data['Source port']
new_data['Destination port'] = data['Destination port']
# do not add the Source hostname and the Destination hostname columns since they are empty
# select the Destination service and assign a number 0 to http, leave the rest as it is
# new_data['Destination service'] = data['Destination service'].apply(lambda x: 0 if x == 'http' else x)
new_data['Destination service'] = data['Destination service']

# select the Direction and assign 0 if the value is "inbound" and 1 if the value is "outbound", leave empty as it is
new_data['Direction'] = data['Direction'].apply(lambda x: 0 if x == 'inbound' else 1 if x == 'outbound' else x)

# DO NOT add the Connections built / torn down since it is redundant with the Operation column
# write new_data to a new CSV file with its own index
new_data.to_csv('Firewall_filtered.csv', index=False)