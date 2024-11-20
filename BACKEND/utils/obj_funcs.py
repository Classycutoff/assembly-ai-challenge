import assemblyai as aai
from flask import jsonify
import librosa

def get_return_obj(transcript: aai.Transcript, resp_obj):
    if transcript.status == aai.TranscriptStatus.error:
        print(transcript.error)
        return jsonify({
            "message": "File transcription failed.", 
            # "path": filepath, 
            'transcription': transcript.error,
            **resp_obj,
            # 'lemur_resp': lemur_resp
        }), 404
    else:
        print(transcript.text)
        return jsonify({
            "message": "File transcribed successfully", 
            # "path": filepath, 
            'transcription': transcript.text,
            **resp_obj
            # 'lemur_resp': lemur_resp,
        }), 200
    

def get_words_per_minute(transcript: aai.Transcript, filepath) -> int:
    if transcript.status == aai.TranscriptStatus.error:
        return None
    word_count = len(transcript.text.split(' '))

    duration = librosa.get_duration(path=filepath)
    seconds_in_minute = 60

    words_per_minute = int((word_count / duration) * seconds_in_minute)
    return words_per_minute


