import re
import whisper
import torch
torch.cuda.empty_cache()

def sanitize_filename(filename: str) -> str:
    filename = filename.strip()
    filename = re.sub(r"\s+", "_", filename)  
    filename = re.sub(r"[^a-zA-Z0-9_.-]", "", filename)
    return filename.lower()


def transcribe_audio(audio):
    model = whisper.load_model("medium").to("cuda")
    result = model.transcribe(audio)
    return result["text"]