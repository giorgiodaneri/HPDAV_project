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