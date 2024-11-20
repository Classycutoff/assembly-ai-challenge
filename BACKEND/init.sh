#!/bin/bash

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate

# Install ffmpeg based on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if command -v brew >/dev/null 2>&1; then
        brew install ffmpeg
    else
        echo "Homebrew not found. Please install ffmpeg manually or install Homebrew first."
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v apt-get >/dev/null 2>&1; then
        sudo apt-get update
        sudo apt-get install -y ffmpeg
    elif command -v yum >/dev/null 2>&1; then
        sudo yum install -y ffmpeg
    elif command -v dnf >/dev/null 2>&1; then
        sudo dnf install -y ffmpeg
    elif command -v pacman >/dev/null 2>&1; then
        sudo pacman -S ffmpeg
    else
        echo "Could not detect package manager. Please install ffmpeg manually."
    fi
elif [[ "$OSTYPE" == "msys"* ]] || [[ "$OSTYPE" == "cygwin"* ]]; then
    # Windows (Git Bash or Cygwin)
    echo "On Windows, please install ffmpeg manually from: https://ffmpeg.org/download.html"
else
    echo "Unsupported operating system. Please install ffmpeg manually."
fi

# Touch .env file if it doesn't exist
if [ ! -f .env ]; then
    touch .env
fi


# Check if ASSEMBLY_API is set in .env
if ! grep -q "^ASSEMBLY_API=\".*\"$\|^ASSEMBLY_API='.*'$" .env; then
    echo -n "Please enter your Assembly AI API key:"
    read -s api_key  # -s flag hides the input
    echo
    echo "ASSEMBLY_API=\"$api_key\"" >> .env
    echo "API key has been added to .env"
fi

echo "Setup complete!"