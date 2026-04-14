#!/bin/bash
#only run if you need to put the app together from scratch

#source .venv/bin/activate
#npx create-react-app frontend
#mv App.js App.css App.test.js index.js index.css reportWebVitals.js setupTests.js logo.svg FrontEndUI.jsx NHANESUI.css "App.css (UI)" "App copy.js" "index copy.js" frontend/src/
cd frontend
npm install react-select react-plotly.js plotly.js
npm start