import pandas as pd
from IPClassification import get_ip_type, get_path_type

def get_dataset():
  """
  Import and filter dataset
  return dataset, len(dataset)
  """
  # Read csv file into a Json object
  dataset = pd.read_csv('../react/public/IDS_global_filtered.csv', header=0).to_json(orient='records')
  ...
  return dataset

def get_dataset_IDS():
  """
  Import and filter IDS dataset
  return dataset_IDS, len(dataset_IDS)
  """
  # Define the file path
  file_path = '../MC2-CSVFirewallandIDSlogs/IDS-0406-replacement.csv'
  file_path2 = '../MC2-CSVFirewallandIDSlogs/IDS-0407.csv'

  # Load the first ten rows of the CSV file
  data = pd.read_csv(file_path)
  data2 = pd.read_csv(file_path2)
  data = pd.concat([data, data2])

  # get the col names
  col_names = data.columns
  print("column names: ", col_names)

  # create a new data frame called new_data
  new_data = pd.DataFrame()

  # process the time col so that only the day and HH:MM are shown. the date is in the M/D/YYYY HH:MM format
  new_data['time'] = data['time'].apply(lambda x: ' '.join([x.split(' ')[0].split('/')[1], x.split(' ')[1]]))

  # apply the map to the sourceIP column 
  # new_data[' sourceIP'] = data[' sourceIP'].apply(map_ip)
  new_data['sourceIP'] = data[' sourceIP']
  new_data['sourcePort'] = data[' sourcePort']

  # apply the map to the destIP column
  # new_data[' destIP'] = data[' destIP'].apply(map_ip)
  new_data['destIP'] = data[' destIP']
  new_data['destPort'] = data[' destPort']

  # get the unique entries in the classification col
  classification = data[' classification'].unique()
  # map all the unique values in the classification col to a number and add them to new_data
  new_data['classification'] = data[' classification'].apply(lambda x: classification.tolist().index(x))
  # print all the unique entries in the classification col 
  # create a dictionary to store the mapping between classification values and their assigned numbers
  classification_mapping = {value: idx for idx, value in enumerate(classification)}
  # print the classification mapping
  print("classification mapping: ", classification_mapping)
  print("classification: ", classification)
  # write the classification mapping to a .txt file
  with open('../MC2-CSVFirewallandIDSlogs/classification_mapping.txt', 'w') as f:
      for key, value in classification_mapping.items():
          f.write(f'{key}: {value}\n')

  # print the relative mapping
  print("classification mapping: ", new_data['classification'].unique())

  # add the priority of the packets
  new_data['priority'] = data[' priority']

  new_data['Source'] = new_data['sourceIP'].apply(get_ip_type)
  new_data['Destination'] = new_data['destIP'].apply(get_ip_type)
  new_data['Firewall'] = new_data.apply(lambda row: get_path_type(row['Source'], row['Destination']), axis=1)


  # NOTE: does not make sense to preserve this entries since they are empty for malicious activities
  # also, does not make sense to map them to numbers since they are too many to reconstruct again
  # # same for packet info and packet info cont'd
  # packet_info = data[' packet info'].unique()
  # packet_info_contd = data['packet info cont\'d'].unique()
  # and lack insightful information anyways
  # map the unique entries of ' packet info' and 'packet info cont'd' to numbers
  # new_data[' packet info'] = data[' packet info'].apply(lambda x: packet_info.tolist().index(x))
  # new_data['packet info cont\'d'] = data['packet info cont\'d'].apply(lambda x: packet_info_contd.tolist().index(x))

  # do not add xref to the final dataset since it is useless
  # write the dataset to a csv file
#   new_data.to_csv('../MC2-CSVFirewallandIDSlogs/IDS_global_filtered.csv', index=False)

  return new_data.to_json(orient='records')

class FirewallDataset:
    def get_dataset_firewall(this):
        # Define the file path
        file_path = '../MC2-CSVFirewallandIDSlogs/Firewall-04062012.csv'
        file_path2 = '../MC2-CSVFirewallandIDSlogs/Firewall-04072012.csv'

        # Load the first ten rows of the CSV file
        data = pd.read_csv(file_path)
        data2 = pd.read_csv(file_path2)
        data = pd.concat([data, data2])

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

        # write the syslog priority mapping to a file
        with open('../MC2-CSVFirewallandIDSlogs/syslog_priority_mapping.txt', 'w') as f:
            for code, priority in syslog_priority_mapping.items():
                f.write(f"{priority}: {code}\n")

        # select the Operation column and assign a value from 0 to n for each unique value
        new_data['Operation'] = data['Operation'].astype('category').cat.codes
        # print all the unique values of Operation and the corresponding assigned number in the new data frame
        operation_mapping = dict(enumerate(data['Operation'].unique()))
        print("\nOperation mapping:")
        for code, operation in operation_mapping.items():
            print(f"{operation}: {code}")

        # write the operation mapping to a file
        with open('../MC2-CSVFirewallandIDSlogs/operation_mapping.txt', 'w') as f:
            for code, operation in operation_mapping.items():
                f.write(f"{operation}: {code}\n")

        # select the Message code and assign a number from 0 to n for each unique value
        new_data['Message code'] = data['Message code'].astype('category').cat.codes
        # print all the unique values of Message code and the corresponding assigned number in the new data frame
        message_code_mapping = dict(enumerate(data['Message code'].unique()))
        print("\nMessage code mapping:")
        for code, message in message_code_mapping.items():
            print(f"{message}: {code}")

        # write the message code mapping to a file
        with open('../MC2-CSVFirewallandIDSlogs/message_code_mapping.txt', 'w') as f:
            for code, message in message_code_mapping.items():
                f.write(f"{message}: {code}\n")

        # select the Protocol and assign 0 if TCP and 1 if UDP, 2 to empty values
        new_data['Protocol'] = data['Protocol'].apply(lambda x: 0 if x == 'TCP' else 1 if x == 'UDP' else 2)

        # write the protocol mapping to a file
        protocol_mapping = {
            "TCP": 0,
            "UDP": 1
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

        # eliminate all the rows where protocol is equal to 2, since Source IP, Destination IP are empty too
        new_data = new_data[new_data['Protocol'] != 2]

        # DO NOT add the Connections built / torn down since it is redundant with the Operation column
        # write new_data to a new CSV file with its own index
        #   new_data.to_csv('../MC2-CSVFirewallandIDSlogs/Firewall_global_filtered.csv', index=False)
        return new_data.to_json(orient='records')
    
    def get_firewall_dataset_filtered(this):
        # Define the file path
        file_path = '../MC2-CSVFirewallandIDSlogs/Firewall_global_filtered.csv'
        # Load the first ten rows of the CSV file
        data = pd.read_csv(file_path)
        print("Finished reading firewall dataset\n")
        return data.to_json(orient='records')