#!/bin/bash
# installs and runs python env and dependencies

python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install flask-cors
#python nhanes_api.py