import time
import os
import json
import re
import io
import logging
import tempfile

from dotenv import load_dotenv
import assemblyai as aai
from flask import Flask, request, jsonify
from flask_cors import CORS
from pydub import AudioSegment
from datetime import datetime
import wave
import librosa

import utils._global as _global
from utils.aai_funcs import get_transcription_obj
from utils.obj_funcs import get_return_obj, get_words_per_minute

load_dotenv()
aai.settings.api_key = os.getenv('ASSEMBLY_API')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:*", "http://127.0.0.1:*"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "supports_credentials": True
    }
})

os.makedirs(os.getenv('UPLOAD_FOLDER'), exist_ok=True)
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER')



@app.route('/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided.'}), 400
    
    file = request.files['file']
    if file:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        file.save(filepath)
    else:
        return jsonify({"message": "File not found", "path": filepath}), 404

    transcript, lemur_resp = get_transcription_obj(filepath)


    words_per_minute = get_words_per_minute(transcript, filepath)
    print(f'WPM: {words_per_minute}')

    return_obj = get_return_obj(
        transcript, 
        {
            'lemur_resp': lemur_resp,
            'wpm': words_per_minute
        }
    )
    print(return_obj)
    return return_obj
    


@app.route('/record', methods=['POST'])
def record_audio():
    try:
        data = request.get_data()
        if not data or len(data) == 0:
            return jsonify({"error": "No audio data received"}), 400
        
        try:
            audio_seg = AudioSegment.from_file(
                io.BytesIO(data), 
                format='webm'
            )
        except Exception as e:
            logger.error(f"Failed to process audio with webm format: {str(e)}")
            try:
                # Fallback to ogg format if webm fails
                audio_seg = AudioSegment.from_file(
                    io.BytesIO(data),
                    format='ogg'
                )
            except Exception as e:
                logger.error(f"Failed to process audio with ogg format: {str(e)}")
                return jsonify({
                    "error": "Could not process audio data",
                    "details": str(e)
                }), 400
            

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{timestamp}_recorded_audio.wav")
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        try:
            audio_seg.export(filepath, format='wav')
        except Exception as e:
            logger.error(f"Failed to export audio: {str(e)}")
            return jsonify({
                "error": "Failed to save audio file",
                "details": str(e)
            }), 500
        

        transcript, lemur_resp = get_transcription_obj(filepath)
        words_per_minute = get_words_per_minute(transcript, filepath)

        return_obj = get_return_obj(
            transcript, 
            {
                'lemur_resp': lemur_resp,
                'wpm': words_per_minute
            }
        )
        return return_obj

        print(transcript.lemur.summarize(
            context='Summarize to the best of your ability.',
            answer_format='a bulleted list'
        ))
    except Exception as e:
        logger.error(f"Unexpected error in record_audio: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500



if __name__ == '__main__':
    start = time.time()
    # main()
    app.run(debug=True)
    print(f'{round(time.time() - start, 2)} seconds.')