import assemblyai as aai
from flask import jsonify

def get_return_obj(transcript: aai.Transcript, lemur_resp):
    if transcript.status == aai.TranscriptStatus.error:
        print(transcript.error)
        return jsonify({
            "message": "File transcription failed.", 
            # "path": filepath, 
            'transcription': transcript.error,
            'lemur_resp': lemur_resp
        }), 404
    else:
        print(transcript.text)
        return jsonify({
            "message": "File transcribed successfully", 
            # "path": filepath, 
            'lemur_resp': lemur_resp,
            'transcription': transcript.text
        }), 200