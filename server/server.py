import dataset
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
# allows cross origin to be called from localhost:3000
# not recommended in production
CORS(app)

# insert code for server initialization if needed
dataset = dataset.get_dataset()

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/getDataset")
def get_dataset():
    return {"dataset": dataset}  