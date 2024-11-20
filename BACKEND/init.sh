#!/bin/bash

echo "Please add your Assembly AI API key to the .env file. This file won't be added to the git repo."



# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate

# Install ffmpeg
brew install ffmpeg

# Touch .env file if it doesn't exist
if [ ! -f .env ]; then
    touch .env
fi


# Check if ASSEMBLY_API is set in .env
if ! grep -q "^ASSEMBLY_API=\".*\"$\|^ASSEMBLY_API='.*'$" .env; then
    echo "Please enter your Assembly AI API key:"
    read api_key
    echo "ASSEMBLY_API=\"$api_key\"" >> .env
    echo "API key has been added to .env"
fi

echo "Setup complete!"