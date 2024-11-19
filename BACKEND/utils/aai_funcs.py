import assemblyai as aai


def get_transcription_obj(filepath) -> aai.Transcript:
    transcriber = aai.Transcriber()
    transcript = transcriber.transcribe(
        filepath,
        config=aai.TranscriptionConfig()
    )

    lemur_resp = transcript.lemur.summarize(
        # context='Please list all the filler words used, and give tips on the transcription.',
        context='I am preparing to give a speech, and I need practical tips to make it engaging and impactful. Could you provide advice on how to improve, and give a list of all the filler words I used?',
        answer_format='a paragraph with the tips for the speaker, and a list of the filler words that are formatted this: Filler words: ["filler_word", ...]',
        final_model=aai.LemurModel.claude3_5_sonnet
    ).response
    return transcript, lemur_resp