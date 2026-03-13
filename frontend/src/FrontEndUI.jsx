import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import Select from 'react-select';
import './NHANESUI.css'; 

function NHANESUI() {
  const [ageRange, setAgeRange] = useState('');
  const [gender, setGender] = useState('');
  const [raceEthnicity, setRaceEthnicity] = useState('');
  const [healthMetric, setHealthMetric] = useState('');
  const [nhanesCycles, setNhanesCycles] = useState([]);
  const [disease, setDisease] = useState('');
  const [graphData, setGraphData] = useState(null);
  const [majorCategoryAttributes, setMajorCategoryAttributes] = useState([]);

  const nhanesCycleOptions = [
    '1999-2000', '2001-2002', '2003-2004', '2005-2006',
    '2007-2008', '2009-2010', '2011-2012', '2013-2014',
    '2015-2016', '2017-2020', '2021-2023'
  ];

  const ageRangeOptions = [
    '0-9', '10-19', '20-29', '30-39', '40-49',
    '50-59', '60-69', '70-79', '80+'
  ];

  // Major Category Attributes Options
  const majorCategoryOptions = [
    { value: "Laboratory Measurements (Sugar, Enzymes, Cholesterol)", label: "Laboratory Measurements (Sugar, Enzymes, Cholesterol)" },
    { value: "Laboratory Measurements (Blood Composition)", label: "Laboratory Measurements (Blood Composition)" },
    { value: "Laboratory Measurements (Minerals)", label: "Laboratory Measurements (Minerals)" },
    { value: "Laboratory Measurements (Albumin and Creatinine)", label: "Laboratory Measurements (Albumin and Creatinine)" },
    { value: "Examination Data (Body Measurements)", label: "Examination Data (Body Measurements)" },
    { value: "Examination Data (Blood Pressure)", label: "Examination Data (Blood Pressure)" },
    { value: "Dietary (General)", label: "Dietary (General)" },
    { value: "Dietary (Diet)", label: "Dietary (Diet)" },
    { value: "Dietary (Vitamins and Minerals)", label: "Dietary (Vitamins and Minerals)" },
  ];

  // Select All option
  const selectAllOption = { value: "*", label: "Select All" };

  const handleRunAnalysis = async () => {
    if (!nhanesCycles.length) {
      alert('Please select at least one NHANES cycle.');
      return;
    }

    const filters = {
      ...(gender && { gender: [gender] }),
      ...(raceEthnicity && { race: [raceEthnicity] }),
      ...(ageRange && { age: ageRange }),
      ...(majorCategoryAttributes.length && { majorCategoryAttributes: majorCategoryAttributes.map(opt => opt.value) }),
    };

    const payload = {
      selections: {
        demographics: {
          file: 'Demographic Variables & Sample Weights',
          filters: filters,
        },
        questionnaire: {
          file: disease,
        },
      },
      cycles: nhanesCycles,
    };

    const CODESPACE_NAME_HERE = `probable-space-chainsaw-69p47w465w6r35rxq`;
    const cs_backend = `https://${CODESPACE_NAME_HERE}-5050.app.github.dev/profile`;

    try {
      const response = await fetch(cs_backend, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        alert('Failed to fetch data. Make sure the API is running.');
        return;
      }

      const blob = await response.blob();
      const reader = new FileReader();

      reader.onload = function () {
        const text = reader.result;
        const rows = text.split('\n').filter(Boolean);
        const headers = rows[0].split(',');
        const data = rows.slice(1).map(row => {
          const values = row.split(',');
          const obj = {};
          headers.forEach((header, i) => {
            obj[header.trim()] = isNaN(values[i]) ? values[i] : Number(values[i]);
          });
          return obj;
        });
        createGraph(data);
      };

      reader.readAsText(blob);

      // Trigger file download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'patient_profile.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing your request.');
    }
  };

const createGraph = (data) => {
  if (!data || data.length === 0) {
    alert("No data returned from backend.");
    setGraphData(null);
    return;
  }

  // Try to automatically detect a disease column
  const diseaseCol = Object.keys(data[0]).find(
    (col) =>
      col.toUpperCase().includes("DIQ") ||
      col.toUpperCase().includes("MCQ") ||
      col.toUpperCase().includes("DISEASE")
  );

  if (!diseaseCol) {
    alert("No disease diagnosis column found in returned data.");
    console.log("Available columns:", Object.keys(data[0]));
    return;
  }

  // Accept multiple possible positive encodings
  const positiveCases = data.filter((row) => {
    const val = row[diseaseCol];

    if (val === null || val === undefined) return false;

    const normalized = String(val).toLowerCase().trim();

    return normalized === "1" ||
           normalized === "yes" ||
           normalized === "true";
   });

  if (positiveCases.length === 0) {
    alert("No positive cases found after filtering.");
    setGraphData(null);
    return;
  }

  const ageCounts = {};

  positiveCases.forEach((row) => {
    const age = Number(row.RIDAGEYR);
    if (!isNaN(age)) {
      ageCounts[age] = (ageCounts[age] || 0) + 1;
    }
  });

  const ages = Object.keys(ageCounts)
    .map(Number)
    .sort((a, b) => a - b);

  const counts = ages.map((age) => ageCounts[age]);

  const trace = {
    x: ages,
    y: counts,
    type: "scatter",
    mode: "lines+markers",
  };

  const layout = {
    title: "Distribution of Positive Disease Diagnoses by Age",
    xaxis: { title: "Age" },
    yaxis: { title: "Number of Cases" },
  };

  setGraphData({ data: [trace], layout });
};

  return (
    <div className="nhanes-ui" style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>NHANES Exploratory Analysis Tool</h1>

      <div className="nav-tabs" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <a href="/" style={{ margin: '0 15px' }}>Home</a> |
        <a href="#filter" style={{ margin: '0 15px' }}>Data Filter</a> |
        <a href="#visualization" style={{ margin: '0 15px' }}>Visualization</a> |
        <a href="#download" style={{ margin: '0 15px' }}>Download</a>
      </div>

      <div id="filter" className="section" style={{ marginBottom: '40px' }}>
        <h2>Filter Patient Data</h2>

        <div style={{ marginBottom: '15px' }}>
          <label>Age Range</label>
          <select
            value={ageRange}
            onChange={e => setAgeRange(e.target.value)}
            style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Select Age Range</option>
            {ageRangeOptions.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Gender</label>
          <select
            value={gender}
            onChange={e => setGender(e.target.value)}
            style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Race/Ethnicity</label>
          <select
            value={raceEthnicity}
            onChange={e => setRaceEthnicity(e.target.value)}
            style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Select Race/Ethnicity</option>
            <option value="Mexican American">Mexican American</option>
            <option value="Other Hispanic">Other Hispanic</option>
            <option value="Non-Hispanic White">Non-Hispanic White</option>
            <option value="Non-Hispanic Black">Non-Hispanic Black</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Health Metric</label>
          <select
            value={healthMetric}
            onChange={e => setHealthMetric(e.target.value)}
            style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Select Health Metric</option>
            <option value="Blood Pressure">Blood Pressure</option>
            <option value="Cholesterol – LDL & Triglycerides">Cholesterol – LDL & Triglycerides</option>
            <option value="BMI">BMI</option>
            <option value="Waist Circumference">Waist Circumference</option>
          </select>
        </div>

        {/* Updated Major Category Attributes */}
        <div style={{ marginBottom: '15px' }}>
          <label>Major Category Attributes</label>
          <Select
            options={[selectAllOption, ...majorCategoryOptions]}
            isMulti
            closeMenuOnSelect={false}
            value={majorCategoryAttributes}
            onChange={(selected) => {
              if (selected?.some(option => option.value === "*")) {
                setMajorCategoryAttributes([...majorCategoryOptions]);
              } else {
                setMajorCategoryAttributes(selected || []);
              }
            }}
            placeholder="Select Major Category Attributes"
            styles={{ container: (provided) => ({ ...provided, marginTop: '5px' }) }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>NHANES Cycles</label>
          <Select
            isMulti
            options={nhanesCycleOptions.map(cycle => ({ value: cycle, label: cycle }))}
            onChange={selectedOptions => setNhanesCycles(selectedOptions.map(option => option.value))}
            styles={{ container: (provided) => ({ ...provided, marginTop: '5px' }) }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Disease</label>
          <select
            value={disease}
            onChange={e => setDisease(e.target.value)}
            style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Select Disease</option>
            <option value="Diabetes">Diabetes</option>
            <option value="Hypertension">Hypertension</option>
            <option value="Cardiovascular">Cardiovascular</option>
            <option value="Sleep Disorders">Sleep Disorders</option>
            <option value="Osteoporosis">Osteoporosis</option>
            <option value="Blood Pressure">Blood Pressure</option>
            <option value="Gout">Gout</option>
            
          </select>
        </div>

        <button
          onClick={handleRunAnalysis}
          style={{
            display: 'block',
            width: '100%',
            padding: '10px',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Run Analysis
        </button>
      </div>

      <div id="visualization" className="section">
        <h2 style={{ marginBottom: '20px' }}>Visualization</h2>
        {graphData ? (
          <Plot data={graphData.data} layout={graphData.layout} style={{ width: '100%' }} />
        ) : (
          <p>No data to visualize yet. Run an analysis first.</p>
        )}
      </div>
    </div>
  );
}

export default NHANESUI;