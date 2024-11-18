#!/bin/bash

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
brew install ffmpeg
cp .env-copy .env 
echo "Please add your Assembly AI API key to the .env file. This file won't be added to the git repo."

