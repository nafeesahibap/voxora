from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)  # IMPORTANT for frontend-backend communication

@app.route("/analyze", methods=["POST"])
def analyze():
    file = request.files["file"]
    df = pd.read_csv(file)

    return jsonify({
        "rows": df.shape[0],
        "columns": df.shape[1],
        "column_names": list(df.columns)
    })

if __name__ == "__main__":
    app.run(debug=True)
