import whisper

def transcribe_audio(audio):
    model = whisper.load_model("small")
    audio = whisper.load_audio(audio)
    audio = whisper.pad_or_trim(audio)
    mel = whisper.log_mel_spectrogram(audio, n_mels=model.dims.n_mels).to(model.device)
    _, probs = model.detect_language(mel)
    print(f"Detected language: {max(probs, key=probs.get)}")
    options = whisper.DecodingOptions()
    result = whisper.decode(model, mel, options)
    return result.text


print(transcribe_audio("recordings/test.mp3"))
