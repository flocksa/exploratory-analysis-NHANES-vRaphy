#!/bin/bash

# this script will run the app
cd workspaces
cd COPY-exploratory-analysis-vRaphy
source .venv/bin/activate
python nhanes_api.py & // run this in a separate terminal! don't forget to run a venv too.


cd workspaces
cd COPY-exploratory-analysis-vRaphy
source .venv/bin/activate
cd ./frontend
npm install react-select react-plotly.js plotly.js
npm start