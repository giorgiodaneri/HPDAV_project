from flask import Flask, request
from flask_cors import CORS
import dataset
from flask import jsonify
import functools
import json

app = Flask(__name__)
CORS(app)


@functools.lru_cache(maxsize=1)  # Cache a single dataset
def get_cached_dataset_IDS():
    # This function will only be called once until the cache is invalidated
    ids_dataset = dataset.get_dataset_IDS()
    return ids_dataset

@functools.lru_cache(maxsize=1)  # Cache a single dataset
def get_cached_dataset_IDS_paged():
    # This function will only be called once until the cache is invalidated
    ids_dataset = dataset.get_dataset_IDS()

    # If it's a JSON string, parse it into a Python dictionary
    if isinstance(ids_dataset, str):
        ids_dataset = json.loads(ids_dataset)
    
    return ids_dataset

@functools.lru_cache(maxsize=1)  # Cache a single dataset
def get_cached_dataset_firewall():
    # This function will only be called once until the cache is invalidated
    print("Start getting firewall dataset")
    firewall_dataset = dataset.get_firewall_dataset_filtered()

    # If it's a JSON string, parse it into a Python dictionary
    if isinstance(firewall_dataset, str):
        firewall_dataset = json.loads(firewall_dataset)  # Parse JSON string to dict
    
    return firewall_dataset

@app.route("/getDataset")
def get_dataset():
    ids_dataset = get_cached_dataset_IDS()
    return {"dataset": ids_dataset} 

@app.route("/getFirewallDataset")
def get_firewall_dataset():
    # firewall_dataset = get_cached_dataset_firewall()  # Cached dataset (which is a list, not a dict)
    firewall_dataset = get_cached_dataset_firewall()
    # Now firewall_dataset is already a list, no need to use `.get()` method
    dataset_records = firewall_dataset  # Directly use it as the list

    # Get query params for pagination
    page = request.args.get('page', type=int, default=1)
    page_size = request.args.get('page_size', type=int, default=10000)
    num_pages = len(dataset_records) // page_size
    print(f"Page: {page} out of {num_pages+1}, Page Size: {page_size}")
    # compute number of pages

    # Validate page and page_size values (ensure they are valid integers and positive)
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10000

    start = (page - 1) * page_size
    end = start + page_size
    if end > len(dataset_records):
        end = len(dataset_records)

    # Paginate the list
    paginated_data = dataset_records[start:end]

    return jsonify({
        "datasetFirewall": paginated_data,  # Return the paginated data
        "total": len(dataset_records)      # Total number of records
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
