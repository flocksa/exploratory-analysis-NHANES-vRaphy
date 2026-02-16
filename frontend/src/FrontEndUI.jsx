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

  const nhanesCycleOptions = [
    '1999-2000', '2001-2002', '2003-2004', '2005-2006',
    '2007-2008', '2009-2010', '2011-2012', '2013-2014',
    '2015-2016', '2017-2018'
  ];

  const ageRangeOptions = [
    '0-9', '10-19', '20-29', '30-39', '40-49',
    '50-59', '60-69', '70-79', '80+'
  ];

  const handleRunAnalysis = async () => {
    if (!nhanesCycles.length) {
      alert('Please select at least one NHANES cycle.');
      return;
    }

    const filters = {
      ...(gender && { gender: [gender] }),
      ...(raceEthnicity && { race: [raceEthnicity] }),
      ...(ageRange && { age: ageRange }),
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
    
    // if using github codespace, replace PASTE_CODESPACE_NAME_HERE with the codespace name retrieved using get_codespace_name.sh!!
    // if you're running these locally, replace cs_backend in fetch() with:
    // 'http://localhost:5050/profile'
    const CODESPACE_NAME_HERE = `probable-space-chainsaw-69p47w465w6r35rxq`;
    const cs_backend = `https://${CODESPACE_NAME_HERE}-5050.app.github.dev/profile`

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
    const diseaseCol = Object.keys(data[0]).find(col => col.startsWith('DIQ010'));
    if (!diseaseCol) {
      alert('No disease diagnosis column found.');
      return;
    }

    const positiveCases = data.filter(row => row[diseaseCol] === 1);

    const ageCounts = {};
    positiveCases.forEach(row => {
      const age = row.RIDAGEYR;
      if (age != null) {
        ageCounts[age] = (ageCounts[age] || 0) + 1;
      }
    });

    const ages = Object.keys(ageCounts).map(Number).sort((a, b) => a - b);
    const counts = ages.map(age => ageCounts[age]);

    const trace = {
      x: ages,
      y: counts,
      type: 'scatter',
      mode: 'lines+markers',
      line: { shape: 'spline' },
      marker: { color: 'teal' },
    };

    const layout = {
      title: 'Distribution of Positive Disease Diagnoses by Age',
      xaxis: { title: 'Age' },
      yaxis: { title: 'Number of Cases' },
      margin: { t: 50, b: 50, l: 50, r: 50 }
    };

    setGraphData({ data: [trace], layout: layout });
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
