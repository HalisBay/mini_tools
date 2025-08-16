from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)
DATA_FILE = '../data/hours.json'

def read_data():
    if not os.path.exists(DATA_FILE):
        return {"workHours": {}, "monthlyTotals": {}, "settings": {"dailyTarget": 8, "weeklyTarget": 40}}
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def write_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify(read_data())

@app.route('/api/data', methods=['POST'])
def update_data():
    data = request.get_json()
    write_data(data)
    return jsonify({"status": "ok"})

@app.route('/api/workhours/<date>', methods=['DELETE'])
def delete_workhour(date):
    data = read_data()
    if date in data['workHours']:
        del data['workHours'][date]
        write_data(data)
        return jsonify({"status": "deleted"})
    return jsonify({"status": "not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
