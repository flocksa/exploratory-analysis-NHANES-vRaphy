from flask import Flask, request, jsonify, send_file
import os
from patient_profile_builder import PatientProfileBuilder, download_nhanes_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

#Instantiate the PatientProfileBuilder with the callable download function.
profile_builder = PatientProfileBuilder(download_nhanes_file)

# Store the last merged file path globally (for visualization access)
MERGED_CSV_PATH = os.path.abspath("patient_profile_temp.csv")

@app.route('/', methods=['GET'])
def index():
    return "NHANES Profile API is running!"

@app.route('/profile', methods=['POST'])
def profile():
    """
    Expects a JSON payload with:
      - selections: a dictionary mapping categories to lists of file descriptions.
      - cycles: a list of cycle years.
    
    Returns:
      The merged patient profile as a CSV file.
    """
    data = request.get_json()
    selections = data.get("selections")
    cycles = data.get("cycles")
    
    if not selections or not cycles:
        return jsonify({'error': 'Please provide both "selections" and "cycles".'}), 400
    
    try:
        profile_df = profile_builder.build_profile(selections, cycles)
        if profile_df.empty:
            return jsonify({'error': 'No data found for the given selections and cycles.'}), 404
        
        temp_csv = os.path.abspath("patient_profile_temp.csv")
        profile_df.to_csv(temp_csv, index=False)
        return send_file(temp_csv, as_attachment=True, download_name="patient_profile.csv")
    except Exception as e:
        print("Error in /profile endpoint:", str(e))
        return jsonify({'error': str(e)}), 500

### TO DO:
# ADD @app.route('/visualization', methods IDK LOOK UPDATEDAPI.PY)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)
