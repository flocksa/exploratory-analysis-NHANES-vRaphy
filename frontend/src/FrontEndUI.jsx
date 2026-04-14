import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import Select from 'react-select';
import './NHANESUI.css'; 

function NHANESUI() {
  const [ageRange, setAgeRange] = useState([]);
  const [gender, setGender] = useState([]);
  const [raceEthnicity, setRaceEthnicity] = useState([]);
  const [nhanesCycles, setNhanesCycles] = useState([]);
  const [disease, setDisease] = useState('');
  const [graphData, setGraphData] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [visualizationType, setVisualizationType] = useState('line');
  const [constantAge, setConstantAge] = useState('');
  const [selectedBarAge, setSelectedBarAge] = useState([]);
  const [boxPlotBiomarker, setBoxPlotBiomarker] = useState('');

  const nhanesCycleOptions = [
    '1999-2000', '2001-2002', '2003-2004', '2005-2006',
    '2007-2008', '2009-2010', '2011-2012', '2013-2014',
    '2015-2016', '2017-2020', '2021-2023'
  ];

  const ageRangeOptions = [
    { value: '0-9', label: '0-9 years' },
    { value: '10-19', label: '10-19 years' },
    { value: '20-29', label: '20-29 years' },
    { value: '30-39', label: '30-39 years' },
    { value: '40-49', label: '40-49 years' },
    { value: '50-59', label: '50-59 years' },
    { value: '60-69', label: '60-69 years' },
    { value: '70-79', label: '70-79 years' },
    { value: '80+', label: '80+ years' },
  ];

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ];

  const barAgeOptions = [
    { value: '0-9', label: '0-9 years' },
    { value: '10-19', label: '10-19 years' },
    { value: '20-29', label: '20-29 years' },
    { value: '30-39', label: '30-39 years' },
    { value: '40-49', label: '40-49 years' },
    { value: '50-59', label: '50-59 years' },
    { value: '60-69', label: '60-69 years' },
    { value: '70-79', label: '70-79 years' },
    { value: '80+', label: '80+ years' },
  ];

  // Box plot biomarker options (BMI and Weight only)
  const boxPlotOptions = [
    { value: 'BMI', label: 'BMI' },
    { value: 'Weight_kg', label: 'Weight (kg)' },
  ];

  // Race/Ethnicity options with codes
  const raceOptions = [
    { value: "Mexican American", label: "Mexican American", code: 1 },
    { value: "Other Hispanic", label: "Other Hispanic", code: 2 },
    { value: "Non-Hispanic White", label: "Non-Hispanic White", code: 3 },
    { value: "Non-Hispanic Black", label: "Non-Hispanic Black", code: 4 },
    { value: "Non-Hispanic Asian", label: "Non-Hispanic Asian", code: 6 },
    { value: "Other", label: "Other Race - Including Multi-Racial", code: 7 },
  ];

  // NHANES Variable Name Mappings (for CSV column renaming)
  const columnMappings = {
    'SEQN': 'ID',
    'RIDAGEYR': 'Age',
    'RIAGENDR': 'Gender',
    'RIDRETH1': 'Race_Ethnicity',
    'RIDRETH3': 'Race_Ethnicity_Detailed',
    'DIQ010': 'Diabetes_Diagnosed',
    'DIQ050': 'Diabetes_Insulin_Use',
    'DIQ070': 'Diabetes_Pills_Use',
    'DID040': 'Diabetes_Age_Diagnosed',
    'MCQ160B': 'Heart_Disease',
    'MCQ160C': 'Heart_Failure',
    'MCQ160D': 'Stroke',
    'MCQ160E': 'Hypertension',
    'MCQ160F': 'High_Cholesterol',
    'MCQ160M': 'Thyroid_Problem',
    'MCQ160P': 'Cancer',
    'MCQ160O': 'COPD',
    'MCQ160L': 'Liver_Condition',
    'MCQ550': 'Gout',
    'MCQ300': 'Sleep_Disorders',
    'MCQ160K': 'Osteoporosis',
    'BMXBMI': 'BMI',
    'BMXWT': 'Weight_kg',
    'BMXHT': 'Height_cm',
    'BMXWAIST': 'Waist_Circumference_cm',
    'BMXARMC': 'Arm_Circumference_cm',
    'BMXHIP': 'Hip_Circumference_cm',
    'BPXOSY1': 'Systolic_BP',
    'BPXODI1': 'Diastolic_BP',
    'LBXTC': 'Total_Cholesterol',
    'LBDLDL': 'LDL_Cholesterol',
    'LBDHDD': 'HDL_Cholesterol',
    'LBDHDL': 'HDL_Cholesterol',
    'LBXTR': 'Triglycerides',
    'LBXGLU': 'Fasting_Glucose',
    'LBXIN': 'Insulin_Level',
    'cycle': 'Survey_Cycle',
    // Dietary variables (1999-2002)
    'DRXTKCAL': 'Calories',
    'DRXTPROT': 'Protein',
    'DRXTCARB': 'Carbs',
    'DRXTSUGR': 'Sugar',
    'DRXTFIBE': 'Fiber',
    'DRXTTFAT': 'Total_Fat',
    'DRXTSFAT': 'Sat_Fat',
    'DRXTMFAT': 'Mono_Fat',
    'DRXTPFAT': 'Poly_Fat',
    'DRXTCHOL': 'Cholesterol',
    // Dietary variables (2005+)
    'DR1TKCAL': 'Calories',
    'DR1TPROT': 'Protein',
    'DR1TCARB': 'Carbs',
    'DR1TSUGR': 'Sugar',
    'DR1TFIBE': 'Fiber',
    'DR1TTFAT': 'Total_Fat',
    'DR1TSFAT': 'Sat_Fat',
    'DR1TMFAT': 'Mono_Fat',
    'DR1TPFAT': 'Poly_Fat',
    'DR1TCHOL': 'Cholesterol',
    // Questionnaire variables
    'BPQ020': 'Ever_Told_High_BP',
    'BPQ030': 'Taking_BP_Medication',
    'BPQ050A': 'Doctor_Told_High_BP',
    'BPQ150': 'Doctor_Told_High_BP',
    'BPQ080': 'High_Cholesterol',
    'BPQ100D': 'Cholesterol_Med',
    'BPQ101D': 'Cholesterol_Med',
    'DIQ160': 'Prediabetes',
    'DIQ060G': 'Insulin_At_Diagnosis',
    'DID060G': 'Insulin_At_Diagnosis',
    'DID060': 'Insulin_At_Diagnosis',
    // Demographics
    'RIDAGEMN': 'Age_Months',
    'DMDMARTL': 'Marital_Status',
    'RIDEXPRG': 'Pregnancy_Status',
    'INDFMPIR': 'Income_Poverty_Ratio',
    'DMDHHSIZ': 'Household_Size',
    'DMQMILIT': 'Military_Status',
    'DMDYRSUS': 'Years_in_US',
    'DMDYRUSZ': 'Years_in_US',
    'DMDYRUSR': 'Years_in_US',
    'INDHHINC': 'Household_Income',
    'INDHHIN2': 'Household_Income',
  };

  // Major Category Attributes with their biomarkers
  const categoryAttributes = {
    'Examination Data': {
      categoryKey: 'examination',
      fileDesc: 'Body Measures',
      biomarkers: [
        { value: 'BMXHT', label: 'Height (cm)' },
        { value: 'BMXWT', label: 'Weight (kg)' },
        { value: 'BMXBMI', label: 'BMI' },
        { value: 'BMXWAIST', label: 'Waist Circumference (cm)' },
        { value: 'BMXARMC', label: 'Arm Circumference (cm)' },
        { value: 'BMXHIP', label: 'Hip Circumference (cm)' },
      ]
    },
    'Dietary Data': {
      categoryKey: 'dietary',
      fileDesc: 'Total Nutrient Intake',
      biomarkers: [
        { value: 'DRXTKCAL', label: 'Calories (1999-2002)' },
        { value: 'DR1TKCAL', label: 'Calories (2005+)' },
        { value: 'DRXTPROT', label: 'Protein (1999-2002)' },
        { value: 'DR1TPROT', label: 'Protein (2005+)' },
        { value: 'DRXTCARB', label: 'Carbs (1999-2002)' },
        { value: 'DR1TCARB', label: 'Carbs (2005+)' },
        { value: 'DRXTSUGR', label: 'Sugar (1999-2002)' },
        { value: 'DR1TSUGR', label: 'Sugar (2005+)' },
        { value: 'DRXTFIBE', label: 'Fiber (1999-2002)' },
        { value: 'DR1TFIBE', label: 'Fiber (2005+)' },
        { value: 'DRXTTFAT', label: 'Total Fat (1999-2002)' },
        { value: 'DR1TTFAT', label: 'Total Fat (2005+)' },
        { value: 'DRXTSFAT', label: 'Saturated Fat (1999-2002)' },
        { value: 'DR1TSFAT', label: 'Saturated Fat (2005+)' },
        { value: 'DRXTMFAT', label: 'Monounsaturated Fat (1999-2002)' },
        { value: 'DR1TMFAT', label: 'Monounsaturated Fat (2005+)' },
        { value: 'DRXTPFAT', label: 'Polyunsaturated Fat (1999-2002)' },
        { value: 'DR1TPFAT', label: 'Polyunsaturated Fat (2005+)' },
        { value: 'DRXTCHOL', label: 'Cholesterol (1999-2002)' },
        { value: 'DR1TCHOL', label: 'Cholesterol (2005+)' },
      ]
    },
    'Questionnaire Data': {
      categoryKey: 'questionnaire',
      fileDesc: null,
      biomarkers: [
        { value: 'BPQ020', label: 'Ever Told High BP' },
        { value: 'BPQ030', label: 'Taking BP Medication' },
        { value: 'BPQ050A', label: 'Doctor Told High BP (1999-2017)' },
        { value: 'BPQ150', label: 'Doctor Told High BP (2021+)' },
        { value: 'BPQ080', label: 'High Cholesterol' },
        { value: 'BPQ100D', label: 'Cholesterol Med (1999-2017)' },
        { value: 'BPQ101D', label: 'Cholesterol Med (2021+)' },
        { value: 'DIQ010', label: 'Diabetes Diagnosed' },
        { value: 'DIQ050', label: 'Insulin Use' },
        { value: 'DIQ160', label: 'Prediabetes (2005+)' },
        { value: 'DIQ060G', label: 'Insulin At Diagnosis (1999)' },
        { value: 'DID060G', label: 'Insulin At Diagnosis (2001-2004)' },
        { value: 'DID060', label: 'Insulin At Diagnosis (2005+)' },
      ]
    },
    'Demographic Data': {
      categoryKey: 'demographics',
      fileDesc: 'Demographic Variables & Sample Weights',
      biomarkers: [
        { value: 'SEQN', label: 'ID' },
        { value: 'RIDAGEYR', label: 'Age (years)' },
        { value: 'RIDAGEMN', label: 'Age (months)' },
        { value: 'RIAGENDR', label: 'Gender' },
        { value: 'RIDRETH1', label: 'Race/Ethnicity' },
        { value: 'DMDMARTL', label: 'Marital Status' },
        { value: 'RIDEXPRG', label: 'Pregnancy Status' },
        { value: 'INDFMPIR', label: 'Income Poverty Ratio' },
        { value: 'DMDHHSIZ', label: 'Household Size' },
        { value: 'DMQMILIT', label: 'Military Status' },
        { value: 'DMDYRSUS', label: 'Years in US (2015-2016)' },
        { value: 'DMDYRUSZ', label: 'Years in US (2017-2020)' },
        { value: 'DMDYRUSR', label: 'Years in US (2021+)' },
        { value: 'INDHHINC', label: 'Household Income (1999-2006)' },
        { value: 'INDHHIN2', label: 'Household Income (2007-2016)' },
      ]
    },
    'Laboratory Measurements': {
      categoryKey: 'laboratory',
      fileDesc: null,
      biomarkers: [
        { value: 'LBXTC', label: 'Total Cholesterol', fileDesc: 'Cholesterol - Total' },
        { value: 'LBDLDL', label: 'LDL Cholesterol', fileDesc: 'Cholesterol - LDL & Triglycerides' },
        { value: 'LBDHDD', label: 'HDL Cholesterol', fileDesc: 'Cholesterol - HDL' },
        { value: 'LBXTR', label: 'Triglycerides', fileDesc: 'Cholesterol - LDL & Triglycerides' },
        { value: 'LBXGLU', label: 'Fasting Glucose', fileDesc: 'Glucose & Insulin' },
        { value: 'LBXIN', label: 'Insulin Level', fileDesc: 'Glucose & Insulin' },
      ]
    }
  };

  // Category options for the "Select All Categories" dropdown
  const allCategoryOptions = [
    { value: 'Examination Data', label: 'Examination Data - All Biomarkers (Height, Weight, BMI, Circumferences)', categoryKey: 'examination', fileDesc: 'Body Measures' },
    { value: 'Dietary Data', label: 'Dietary Data - All Biomarkers (Calories, Protein, Carbs, Fats, Cholesterol)', categoryKey: 'dietary', fileDesc: 'Total Nutrient Intake' },
    { value: 'Laboratory Measurements', label: 'Laboratory Measurements - All Biomarkers (Cholesterol, Glucose, Insulin)', categoryKey: 'laboratory', fileDesc: null },
    { value: 'Demographic Data', label: 'Demographic Data - All Biomarkers (Age, Gender, Race, Income, Household)', categoryKey: 'demographics', fileDesc: 'Demographic Variables & Sample Weights' },
    { value: 'Questionnaire Data', label: 'Questionnaire Data - All Biomarkers (BP, Diabetes, Medications)', categoryKey: 'questionnaire', fileDesc: null },
  ];

  // Get all available biomarker options for the dropdown
  const getAllAttributeOptions = () => {
    const options = [];
    Object.entries(categoryAttributes).forEach(([category, data]) => {
      options.push({
        label: category,
        options: data.biomarkers.map(b => ({
          ...b,
          category: category,
          categoryKey: data.categoryKey
        }))
      });
    });
    return options;
  };

  // Handle category selection - adds all biomarkers from selected categories
  const handleCategorySelection = (selected) => {
    // Check if "Select All Categories" was selected
    if (selected && selected.some(option => option.value === "*")) {
      const allCategories = allCategoryOptions;
      setSelectedCategories(allCategories);

      // Add all biomarkers from all categories
      const allBiomarkers = [];
      allCategories.forEach(cat => {
        const categoryName = cat.value;
        const categoryData = categoryAttributes[categoryName];
        if (categoryData) {
          categoryData.biomarkers.forEach(biomarker => {
            allBiomarkers.push({
              ...biomarker,
              category: categoryName,
              categoryKey: categoryData.categoryKey
            });
          });
        }
      });

      // Merge with existing selections, avoiding duplicates
      const existingValues = new Set(selectedAttributes.map(a => a.value));
      const merged = [...selectedAttributes];

      allBiomarkers.forEach(b => {
        if (!existingValues.has(b.value)) {
          merged.push(b);
          existingValues.add(b.value);
        }
      });

      setSelectedAttributes(merged);
      return;
    }

    setSelectedCategories(selected || []);

    if (!selected || selected.length === 0) {
      return;
    }

    // Get all biomarkers from selected categories
    const newBiomarkers = [];
    selected.forEach(cat => {
      const categoryName = cat.value;
      const categoryData = categoryAttributes[categoryName];
      if (categoryData) {
        categoryData.biomarkers.forEach(biomarker => {
          newBiomarkers.push({
            ...biomarker,
            category: categoryName,
            categoryKey: categoryData.categoryKey
          });
        });
      }
    });

    // Merge with existing selections, avoiding duplicates
    const existingValues = new Set(selectedAttributes.map(a => a.value));
    const merged = [...selectedAttributes];

    newBiomarkers.forEach(b => {
      if (!existingValues.has(b.value)) {
        merged.push(b);
        existingValues.add(b.value);
      }
    });

    setSelectedAttributes(merged);
  };

  // Helper function to get disease column name
  const getDiseaseColumnName = (disease) => {
    const diseaseMap = {
      'Diabetes': 'DIQ010',
      'Hypertension': 'MCQ160E',
      'Cardiovascular': 'MCQ160B',
      'Sleep Disorders': 'MCQ300',
      'Osteoporosis': 'MCQ160K',
      'Blood Pressure': 'BPXOSY1',
      'Gout': 'MCQ550'
    };
    return diseaseMap[disease] || disease;
  };

  // Helper function to get readable disease name for CSV
  const getReadableDiseaseName = (diseaseCol) => {
    const readableMap = {
      'DIQ010': 'Diabetes_Diagnosed',
      'MCQ160E': 'Hypertension',
      'MCQ160B': 'Heart_Disease',
      'MCQ300': 'Sleep_Disorders',
      'MCQ160K': 'Osteoporosis',
      'BPXOSY1': 'Systolic_BP',
      'MCQ550': 'Gout'
    };
    return readableMap[diseaseCol] || diseaseCol;
  };

  // Group selected attributes by category for the backend
  const getAttributesByCategory = () => {
    const grouped = {};
    selectedAttributes.forEach(attr => {
      const category = attr.categoryKey;
      if (!grouped[category]) {
        grouped[category] = {
          biomarkers: [],
          fileDesc: categoryAttributes[attr.category]?.fileDesc,
          category: attr.category
        };
      }
      grouped[category].biomarkers.push(attr.value);

      // For laboratory, determine fileDesc based on biomarker
      if (category === 'laboratory' && attr.fileDesc) {
        if (!grouped[category].fileDescs) {
          grouped[category].fileDescs = new Set();
        }
        grouped[category].fileDescs.add(attr.fileDesc);
      }
    });
    return grouped;
  };

  // Helper function to filter data by selected age ranges and genders
  const filterDataBySelections = (data) => {
    const selectedAgeRanges = ageRange.map(a => a.value);
    const selectedGenders = gender.map(g => g.value);

    return data.filter(row => {
      // Parse age
      let age = row.Age || row.RIDAGEYR;
      if (typeof age === 'string') age = parseInt(age, 10);
      if (isNaN(age)) return false;

      const rowAgeRange = getAgeRange(age);

      // Check age filter - if no age ranges selected, include all
      if (selectedAgeRanges.length > 0 && !selectedAgeRanges.includes(rowAgeRange)) {
        return false;
      }

      // Check gender filter - if no genders selected, include all
      if (selectedGenders.length > 0) {
        let rowGender = row.Gender || row.RIAGENDR;
        if (typeof rowGender === 'number') {
          rowGender = rowGender === 1 ? 'Male' : rowGender === 2 ? 'Female' : 'Unknown';
        }
        if (!selectedGenders.includes(rowGender)) {
          return false;
        }
      }

      return true;
    });
  };

  const handleRunAnalysis = async () => {
    if (!nhanesCycles.length) {
      alert('Please select at least one NHANES cycle.');
      return;
    }

    const filters = {
      ...(gender.length > 0 && { gender: gender.map(g => g.value) }),
      ...(raceEthnicity.length > 0 && { race: raceEthnicity.map(r => r.value) }),
      ...(ageRange.length > 0 && { age: ageRange.map(a => a.value) }),
    };

    // Build selections with attributes by category
    const selections = {
      demographics: {
        file: 'Demographic Variables & Sample Weights',
        filters: filters,
      }
    };

    // Add questionnaire file for disease
    if (disease) {
      const diseaseFileMap = {
        'Diabetes': 'Diabetes',
        'Hypertension': 'Blood Pressure Questionnaire',
        'Cardiovascular': 'Blood Pressure Questionnaire',
        'Blood Pressure': 'Blood Pressure Questionnaire',
      };
      const fileName = diseaseFileMap[disease] || disease;
      selections.questionnaire = {
        file: fileName,
      };
    }

    // Add selected attributes by category
    const attributesByCategory = getAttributesByCategory();

    // Handle examination data
    if (attributesByCategory.examination) {
      selections.examination = {
        file: 'Body Measures',
        biomarkers: attributesByCategory.examination.biomarkers
      };
    }

    // Handle dietary data
    if (attributesByCategory.dietary) {
      selections.dietary = {
        file: 'Total Nutrient Intake',
        biomarkers: attributesByCategory.dietary.biomarkers
      };
    }

    // Handle laboratory data - may need multiple files
    if (attributesByCategory.laboratory) {
      const labData = attributesByCategory.laboratory;
      const fileDescs = labData.fileDescs ? Array.from(labData.fileDescs) : ['Cholesterol - Total'];

      selections.laboratory = {
        file: fileDescs[0],
        biomarkers: labData.biomarkers,
        allFiles: fileDescs
      };
    }

    const payload = {
      selections: selections,
      cycles: nhanesCycles,
    };

    console.log('Sending payload:', payload);

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

        // Rename headers to readable names
        const renamedHeaders = headers.map(h => {
          const trimmed = h.trim();
          return columnMappings[trimmed] || trimmed;
        });

        // Also rename the disease column specifically
        const diseaseCol = getDiseaseColumnName(disease);
        const finalHeaders = renamedHeaders.map(h => {
          if (h === diseaseCol || h === getReadableDiseaseName(diseaseCol)) {
            return getReadableDiseaseName(diseaseCol);
          }
          return h;
        });

        // Reconstruct CSV with renamed headers
        const renamedCSV = [finalHeaders.join(',')].concat(rows.slice(1)).join('\n');

        const data = rows.slice(1).map(row => {
          const values = row.split(',');
          const obj = {};
          headers.forEach((header, i) => {
            const trimmedHeader = header.trim();
            const renamedHeader = columnMappings[trimmedHeader] || trimmedHeader;
            obj[renamedHeader] = isNaN(values[i]) ? values[i] : Number(values[i]);
          });
          return obj;
        });

        console.log("Data loaded:", data.length, "rows");
        console.log("Columns:", finalHeaders);
        console.log("First row:", data[0]);

        // Filter data by selected age ranges and genders before creating graph
        const filteredData = filterDataBySelections(data);
        console.log("Filtered data:", filteredData.length, "rows");

        createGraph(filteredData, finalHeaders);

        // Trigger file download with renamed columns (use filtered data for CSV too)
        const filteredRows = filteredData.map(obj => finalHeaders.map(h => obj[h]).join(','));
        const filteredCSV = [finalHeaders.join(',')].concat(filteredRows).join('\n');
        const renamedBlob = new Blob([filteredCSV], { type: 'text/csv' });
        const url = window.URL.createObjectURL(renamedBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'patient_profile.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      reader.readAsText(blob);

    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing your request.');
    }
  };

  const isPositiveCase = (val) => {
    if (val === null || val === undefined) return false;
    const normalized = String(val).toLowerCase().trim();
    return normalized === "1" || normalized === "yes" || normalized === "true" || normalized === "1.0";
  };

  const getAgeRange = (age) => {
    age = parseInt(age, 10);
    if (isNaN(age)) return null;

    if (age >= 0 && age <= 9) return '0-9';
    if (age >= 10 && age <= 19) return '10-19';
    if (age >= 20 && age <= 29) return '20-29';
    if (age >= 30 && age <= 39) return '30-39';
    if (age >= 40 && age <= 49) return '40-49';
    if (age >= 50 && age <= 59) return '50-59';
    if (age >= 60 && age <= 69) return '60-69';
    if (age >= 70 && age <= 79) return '70-79';
    if (age >= 80) return '80+';
    return null;
  };

  const createGraph = (data, headers) => {
    if (!data || data.length === 0) {
      alert("No data returned from backend.");
      setGraphData(null);
      return;
    }

    const readableDiseaseName = getReadableDiseaseName(getDiseaseColumnName(disease));
    const diseaseCol = headers.find(h => h === readableDiseaseName) || 
                       Object.keys(data[0]).find(k => k.toLowerCase().includes('diabetes') || 
                                                    k.toLowerCase().includes(disease.toLowerCase()));

    if (!diseaseCol) {
      alert("No disease diagnosis column found in returned data.");
      console.log("Available columns:", Object.keys(data[0]));
      return;
    }

    console.log("Using disease column:", diseaseCol);

    if (visualizationType === 'line') {
      createLineGraph(data, diseaseCol, readableDiseaseName);
    } else if (visualizationType === 'bar') {
      createBarGraph(data, diseaseCol, readableDiseaseName);
    } else if (visualizationType === 'boxplot') {
      createBoxPlot(data, diseaseCol, readableDiseaseName);
    }
  };

  // LINE GRAPH
  const createLineGraph = (data, diseaseCol, readableDiseaseName) => {
    if (!constantAge) {
      alert("Please select a constant age range for the line graph.");
      return;
    }

    const cycleStats = {};
    nhanesCycles.forEach(cycle => {
      cycleStats[cycle] = { total: 0, afflicted: 0 };
    });

    data.forEach((row) => {
      const age = parseInt(row.Age || row.RIDAGEYR, 10);
      const ageRange = getAgeRange(age);
      const cycle = row.Survey_Cycle || row.cycle;

      // Only include data matching the constant age (for line graph visualization)
      if (cycle && cycleStats[cycle] !== undefined && ageRange === constantAge) {
        cycleStats[cycle].total++;
        if (isPositiveCase(row[diseaseCol])) {
          cycleStats[cycle].afflicted++;
        }
      }
    });

    const cycles = Object.keys(cycleStats).sort();
    const percentages = cycles.map(cycle => {
      const stats = cycleStats[cycle];
      return stats.total > 0 ? (stats.afflicted / stats.total) * 100 : 0;
    });

    // Build filter description for title
    const filterParts = [];
    if (gender.length > 0) filterParts.push(gender.map(g => g.label).join(', '));
    if (raceEthnicity.length > 0) filterParts.push(raceEthnicity.map(r => r.label).join(', '));
    filterParts.push(`${constantAge} years`);
    const filterDesc = filterParts.join(', ');

    // Store counts for hover text
    const counts = cycles.map(cycle => {
      const stats = cycleStats[cycle];
      return { afflicted: stats.afflicted, total: stats.total };
    });

    const trace = {
      x: cycles,
      y: percentages,
      type: 'scatter',
      mode: 'lines+markers',
      name: readableDiseaseName,
      line: { color: '#007BFF', width: 3 },
      marker: { size: 10, color: '#007BFF' },
      customdata: counts,
      hovertemplate: 'Cycle: %{x}<br>Percentage: %{y:.2f}%<br>Count: %{customdata.afflicted}/%{customdata.total}<extra></extra>',
    };

    const layout = {
      title: {
        text: `${readableDiseaseName.replace(/_/g, ' ')} Prevalence Over Time<br><sub>${filterDesc}</sub>`,
        font: { size: 16 }
      },
      xaxis: { 
        title: { text: 'NHANES Survey Cycle', font: { size: 14 } },
        tickangle: -45,
        tickfont: { size: 10 },
        showgrid: true,
        gridcolor: '#e1e1e1'
      },
      yaxis: { 
        title: { text: 'Percentage Afflicted (%)', font: { size: 14 } },
        range: [0, Math.max(...percentages) * 1.1 || 100],
        showgrid: true,
        gridcolor: '#e1e1e1'
      },
      hovermode: 'closest',
      plot_bgcolor: '#f8f9fa',
      paper_bgcolor: '#ffffff',
    };

    setGraphData({ data: [trace], layout });
  };

  // BAR GRAPH
  const createBarGraph = (data, diseaseCol, readableDiseaseName) => {
    console.log("=== BAR GRAPH DEBUG ===");
    console.log("selectedBarAge:", selectedBarAge);

    if (!selectedBarAge || selectedBarAge.length === 0) {
      alert("Please select at least one age demographic for the bar graph.");
      return;
    }

    const ageRanges = selectedBarAge.map(opt => opt.value);
    console.log("Age ranges:", ageRanges);
    console.log("Total rows:", data.length);

    const genders = ['Male', 'Female', 'All'];
    const genderColors = { 'Male': '#007BFF', 'Female': '#FF69B4', 'All': '#28a745' };

    const traces = genders.map(gender => {
      const percentages = ageRanges.map(ageRange => {
        let total = 0;
        let afflicted = 0;

        data.forEach((row) => {
          // Parse age
          let age = row.Age || row.RIDAGEYR;
          if (typeof age === 'string') age = parseInt(age, 10);
          if (isNaN(age)) return;

          // Get age range
          const rowAgeRange = getAgeRange(age);
          if (rowAgeRange !== ageRange) return;

          // Get gender - check both mapped and unmapped
          let rowGender = row.Gender || row.RIAGENDR;
          if (typeof rowGender === 'number') {
            rowGender = rowGender === 1 ? 'Male' : rowGender === 2 ? 'Female' : 'Unknown';
          }

          if (gender !== 'All' && rowGender !== gender) return;

          total++;
          if (isPositiveCase(row[diseaseCol])) {
            afflicted++;
          }
        });

        const percentage = total > 0 ? (afflicted / total) * 100 : 0;
        console.log(`Age ${ageRange}, Gender ${gender}: ${afflicted}/${total} = ${percentage.toFixed(2)}%`);
        return percentage;
      });

      // Store counts for hover
      const counts = ageRanges.map(ageRange => {
        let total = 0;
        let afflicted = 0;
        data.forEach((row) => {
          let age = row.Age || row.RIDAGEYR;
          if (typeof age === 'string') age = parseInt(age, 10);
          if (isNaN(age)) return;
          const rowAgeRange = getAgeRange(age);
          if (rowAgeRange !== ageRange) return;
          let rowGender = row.Gender || row.RIAGENDR;
          if (typeof rowGender === 'number') {
            rowGender = rowGender === 1 ? 'Male' : rowGender === 2 ? 'Female' : 'Unknown';
          }
          if (gender !== 'All' && rowGender !== gender) return;
          total++;
          if (isPositiveCase(row[diseaseCol])) afflicted++;
        });
        return { afflicted, total };
      });

      return {
        x: ageRanges,
        y: percentages,
        type: 'bar',
        name: gender,
        marker: { color: genderColors[gender] },
        text: percentages.map(p => p.toFixed(1) + '%'),
        textposition: 'auto',
        customdata: counts,
        hovertemplate: 'Age: %{x}<br>Gender: ' + gender + '<br>Percentage: %{y:.2f}%<br>Count: %{customdata.afflicted}/%{customdata.total}<extra></extra>',
      };
    });

    // Build filter description for title
    const filterParts = [];
    if (raceEthnicity.length > 0) filterParts.push(raceEthnicity.map(r => r.label).join(', '));
    const filterDesc = filterParts.length > 0 ? filterParts.join(', ') : 'All Populations';

    const layout = {
      title: {
        text: `${readableDiseaseName.replace(/_/g, ' ')} Prevalence by Age and Gender<br><sub>${filterDesc}</sub>`,
        font: { size: 16 }
      },
      xaxis: { 
        title: { text: 'Age Demographic (years)', font: { size: 14 } },
        tickangle: 0,
        showgrid: false,
      },
      yaxis: { 
        title: { text: 'Percentage Afflicted (%)', font: { size: 14 } },
        range: [0, 100],
        showgrid: true,
        gridcolor: '#e1e1e1'
      },
      barmode: 'group',
      legend: {
        title: { text: 'Gender' },
        x: 0.02,
        y: 0.98,
        bgcolor: 'rgba(255,255,255,0.8)',
      },
      hovermode: 'closest',
      plot_bgcolor: '#f8f9fa',
      paper_bgcolor: '#ffffff',
    };

    setGraphData({ data: traces, layout });
  };

  // BOX PLOT
  const createBoxPlot = (data, diseaseCol, readableDiseaseName) => {
    if (!boxPlotBiomarker) {
      alert("Please select a biomarker (BMI or Weight) for the box plot.");
      return;
    }

    // Check if the biomarker column exists in the data
    const biomarkerCol = boxPlotBiomarker === 'BMI' ? 'BMI' : 'Weight_kg';

    if (!data[0].hasOwnProperty(biomarkerCol)) {
      alert(`Column ${biomarkerCol} not found in data. Please make sure to select BMI or Weight in the Data Attributes section.`);
      return;
    }

    // Separate data into diabetic and non-diabetic groups
    const diabeticValues = [];
    const nonDiabeticValues = [];

    data.forEach(row => {
      const value = parseFloat(row[biomarkerCol]);
      if (isNaN(value)) return;

      if (isPositiveCase(row[diseaseCol])) {
        diabeticValues.push(value);
      } else {
        nonDiabeticValues.push(value);
      }
    });

    if (diabeticValues.length === 0 && nonDiabeticValues.length === 0) {
      alert("No valid data found for the selected biomarker.");
      return;
    }

    // Build filter description for title
    const filterParts = [];
    if (gender.length > 0) filterParts.push(gender.map(g => g.label).join(', '));
    if (raceEthnicity.length > 0) filterParts.push(raceEthnicity.map(r => r.label).join(', '));
    if (ageRange.length > 0) filterParts.push(ageRange.map(a => a.label).join(', '));
    const filterDesc = filterParts.length > 0 ? filterParts.join(', ') : 'All Populations';

    const traces = [
      {
        y: nonDiabeticValues,
        x: Array(nonDiabeticValues.length).fill('No Diabetes'),
        type: 'box',
        name: 'No Diabetes',
        boxpoints: 'outliers',
        marker: { color: '#28a745' },
        line: { color: '#28a745' },
        hovertemplate: 'No Diabetes<br>%{y:.2f}<extra></extra>',
      },
      {
        y: diabeticValues,
        x: Array(diabeticValues.length).fill('Diabetes'),
        type: 'box',
        name: 'Diabetes',
        boxpoints: 'outliers',
        marker: { color: '#dc3545' },
        line: { color: '#dc3545' },
        hovertemplate: 'Diabetes<br>%{y:.2f}<extra></extra>',
      }
    ];

    const layout = {
      title: {
        text: `${boxPlotBiomarker} Distribution by Diabetes Status<br><sub>${filterDesc}</sub>`,
        font: { size: 16 }
      },
      xaxis: {
        title: { text: 'Diabetes Status', font: { size: 14 } },
        showgrid: false,
      },
      yaxis: {
        title: { text: boxPlotBiomarker, font: { size: 14 } },
        showgrid: true,
        gridcolor: '#e1e1e1'
      },
      boxmode: 'group',
      hovermode: 'closest',
      plot_bgcolor: '#f8f9fa',
      paper_bgcolor: '#ffffff',
      showlegend: false,
      annotations: [
        {
          x: 'No Diabetes',
          y: Math.max(...nonDiabeticValues) * 1.05,
          text: `n=${nonDiabeticValues.length}`,
          showarrow: false,
          font: { size: 12, color: '#28a745' }
        },
        {
          x: 'Diabetes',
          y: Math.max(...diabeticValues) * 1.05,
          text: `n=${diabeticValues.length}`,
          showarrow: false,
          font: { size: 12, color: '#dc3545' }
        }
      ]
    };

    setGraphData({ data: traces, layout });
  };

  return (
    <div className="nhanes-ui" style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
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
          <label>Age Range (Filter)</label>
          <Select
            isMulti
            options={[{ value: "*", label: "Select All Age Ranges" }, ...ageRangeOptions]}
            value={ageRange}
            onChange={(selected) => {
              if (selected && selected.some(option => option.value === "*")) {
                setAgeRange(ageRangeOptions);
              } else {
                setAgeRange(selected || []);
              }
            }}
            placeholder="Select Age Ranges (Optional Filter)"
            styles={{ container: (provided) => ({ ...provided, marginTop: '5px' }) }}
          />
          <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
            <strong>Note:</strong> Only data within selected age ranges will be included in the CSV and visualizations.
          </small>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Gender (Filter)</label>
          <Select
            isMulti
            options={[{ value: "*", label: "Select All Genders" }, ...genderOptions]}
            value={gender}
            onChange={(selected) => {
              if (selected && selected.some(option => option.value === "*")) {
                setGender(genderOptions);
              } else {
                setGender(selected || []);
              }
            }}
            placeholder="Select Genders (Optional Filter)"
            styles={{ container: (provided) => ({ ...provided, marginTop: '5px' }) }}
          />
          <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
            <strong>Note:</strong> Only data for selected genders will be included in the CSV and visualizations.
          </small>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Race/Ethnicity (Select Multiple)</label>
          <Select
            isMulti
            options={[{ value: "*", label: "Select All Races" }, ...raceOptions]}
            value={raceEthnicity}
            onChange={(selected) => {
              if (selected && selected.some(option => option.value === "*")) {
                setRaceEthnicity(raceOptions);
              } else {
                setRaceEthnicity(selected || []);
              }
            }}
            placeholder="Select Race/Ethnicity (optional)"
            styles={{ container: (provided) => ({ ...provided, marginTop: '5px' }) }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Select All Categories (Quick Select)</label>
          <Select
            isMulti
            options={[{ value: "*", label: "Select All Categories" }, ...allCategoryOptions]}
            value={selectedCategories}
            onChange={handleCategorySelection}
            placeholder="Select entire categories to include all their biomarkers..."
            styles={{ 
              container: (provided) => ({ ...provided, marginTop: '5px' }),
              multiValue: (provided) => ({ ...provided, backgroundColor: '#28a745' }),
              multiValueLabel: (provided) => ({ ...provided, color: 'white' }),
            }}
          />
          <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
            <strong>Quick select:</strong> Choose entire categories to automatically include ALL biomarkers from that category in your CSV. Combines with individual selections below.
          </small>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Data Attributes to Include (Individual Select)</label>
          <Select
            isMulti
            options={getAllAttributeOptions()}
            value={selectedAttributes}
            onChange={setSelectedAttributes}
            placeholder="Select individual biomarkers and attributes to include in CSV..."
            styles={{ 
              container: (provided) => ({ ...provided, marginTop: '5px' }),
              groupHeading: (provided) => ({ ...provided, fontWeight: 'bold', color: '#007BFF' })
            }}
            formatGroupLabel={(data) => (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>{data.label}</span>
                <span style={{ 
                  backgroundColor: '#007BFF', 
                  color: 'white', 
                  borderRadius: '10px', 
                  padding: '2px 8px',
                  fontSize: '12px'
                }}>
                  {data.options.length} options
                </span>
              </div>
            )}
          />
          <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
            <strong>Fine-tune:</strong> Select specific biomarkers individually. Use this to add individual biomarkers or remove unwanted ones from category selections above.
          </small>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>NHANES Cycles</label>
          <Select
            isMulti
            options={[{ value: "*", label: "Select All Cycles" }, ...nhanesCycleOptions.map(cycle => ({ value: cycle, label: cycle }))]}
            onChange={selectedOptions => {
              if (selectedOptions && selectedOptions.some(option => option.value === "*")) {
                setNhanesCycles(nhanesCycleOptions);
              } else {
                setNhanesCycles(selectedOptions ? selectedOptions.map(option => option.value) : []);
              }
            }}
            value={nhanesCycles.map(cycle => ({ value: cycle, label: cycle }))}
            placeholder="Select NHANES Cycles"
            styles={{ container: (provided) => ({ ...provided, marginTop: '5px' }) }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Disease</label>
          <select value={disease} onChange={e => setDisease(e.target.value)} style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}>
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

        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Visualization Settings</h3>

          <div style={{ marginBottom: '15px' }}>
            <label>Visualization Type</label>
            <select value={visualizationType} onChange={e => setVisualizationType(e.target.value)} style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}>
              <option value="line">Line Graph (Cycles vs Percentage - Constant Age)</option>
              <option value="bar">Bar Graph (Age Demographics vs Percentage - By Gender)</option>
              <option value="boxplot">Box Plot (BMI/Weight Distribution by Diabetes Status)</option>
            </select>
          </div>

          {visualizationType === 'line' && (
            <div style={{ marginBottom: '15px' }}>
              <label>Constant Age Range (for Line Graph)</label>
              <select value={constantAge} onChange={e => setConstantAge(e.target.value)} style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}>
                <option value="">Select Age Range</option>
                {ageRangeOptions.map(range => (<option key={range.value} value={range.value}>{range.label}</option>))}
              </select>
              <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                <strong>Note:</strong> This selects which age range to display on the line graph. The data is already filtered by your Age Range selections above.
              </small>
            </div>
          )}

          {visualizationType === 'bar' && (
            <div style={{ marginBottom: '15px' }}>
              <label>Age Demographics (for Bar Graph)</label>
              <Select
                isMulti
                options={[{ value: "*", label: "Select All Age Groups" }, ...barAgeOptions]}
                value={selectedBarAge}
                onChange={(selected) => {
                  if (selected && selected.some(option => option.value === "*")) {
                    setSelectedBarAge(barAgeOptions);
                  } else {
                    setSelectedBarAge(selected || []);
                  }
                }}
                placeholder="Select age groups to compare"
                styles={{ container: (provided) => ({ ...provided, marginTop: '5px' }) }}
              />
              <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                <strong>Note:</strong> These age groups are for display purposes on the bar graph. The data is already filtered by your Age Range selections above.
              </small>
            </div>
          )}

          {visualizationType === 'boxplot' && (
            <div style={{ marginBottom: '15px' }}>
              <label>Biomarker for Box Plot</label>
              <select value={boxPlotBiomarker} onChange={e => setBoxPlotBiomarker(e.target.value)} style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}>
                <option value="">Select Biomarker</option>
                {boxPlotOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
              <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                <strong>Note:</strong> Select either BMI or Weight to visualize the distribution comparing diabetic vs non-diabetic patients. Make sure to also select the corresponding biomarker in the Data Attributes section above.
              </small>
            </div>
          )}
        </div>

        <button onClick={handleRunAnalysis} style={{ display: 'block', width: '100%', padding: '12px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
          Run Analysis
        </button>
      </div>

      <div id="visualization" className="section">
        <h2 style={{ marginBottom: '20px' }}>Visualization</h2>
        {graphData ? (
          <Plot data={graphData.data} layout={graphData.layout} style={{ width: '100%', height: '500px' }} config={{ responsive: true }} />
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No data to visualize yet. Configure your filters and click "Run Analysis".</p>
        )}
      </div>
    </div>
  );
}

export default NHANESUI;
