import assemblyai as aai


def get_transcription_obj(filepath) -> tuple[aai.Transcript, aai.lemur]:
    transcriber = aai.Transcriber()
    transcript = transcriber.transcribe(
        filepath,
        config=aai.TranscriptionConfig()
    )


    if check_if_text_inside_transcript(transcript):
        lemur_resp = transcript.lemur.summarize(
            # context='Please list all the filler words used, and give tips on the transcription.',
            context='I am preparing to give a speech, and I need practical tips to make it engaging and impactful. Could you provide advice on how to improve, and give a list of all the filler words I used?',
            answer_format='a paragraph with the tips for the speaker, and a list of the filler words that are formatted this: Filler words: ["filler_word", ...]',
            final_model=aai.LemurModel.claude3_5_sonnet
        ).response
    else:
        lemur_resp = None
    return transcript, lemur_resp


def check_if_text_inside_transcript(transcript_resp: aai.Transcript): 
    if transcript_resp.status == aai.TranscriptStatus.error:
        return False
    else:
        return True