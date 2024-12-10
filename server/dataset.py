import pandas as pd

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
  file_path = '../MC2-CSVFirewallandIDSlogs/IDS-0406.csv'
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
  new_data.to_csv('../MC2-CSVFirewallandIDSlogs/IDS_global_filtered.csv', index=False)

  return new_data.to_json(orient='records')