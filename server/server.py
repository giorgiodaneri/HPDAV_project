import dataset
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
# allows cross origin to be called from localhost:3000
# not recommended in production
CORS(app)

# insert code for server initialization if needed
# dataset = dataset.get_dataset_IDS()
dataset = dataset.get_dataset_firewall()

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/getDataset")
def get_dataset():
    return {"dataset": dataset}  

# define a function that calls the script filter_IDS.py to clean the IDS dataset
@app.route("/filterIDS")
def get_dataset_IDS():
    return {"dataset_IDS": dataset}

@app.route("/filter_firewall")
def get_dataset_firewall():
    return {"dataset_firewall": dataset}

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
