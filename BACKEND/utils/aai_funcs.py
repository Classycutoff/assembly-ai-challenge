import assemblyai as aai


def get_transcription_obj(filepath) -> aai.Transcript:
    transcriber = aai.Transcriber()
    transcript = transcriber.transcribe(
        filepath,
        config=aai.TranscriptionConfig()
    )

    lemur_resp = transcript.lemur.summarize(
        context='Please list all the filler words used, and give tips on the transcription.',
        answer_format='A simple title with Heading 1,a paragraph with the tips for the speaker, and a list of the filler words under their own heading.'
    ).response
    return transcript, lemur_resp