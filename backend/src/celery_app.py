from celery import Celery
import whisper
import torch
torch.cuda.empty_cache()

celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0", 
)

def transcribe_audio(audio):
    model = whisper.load_model("medium").to("cuda")
    result = model.transcribe(audio)
    return result["text"]

@celery_app.task
def transcribe_given_audio(audio):
    return transcribe_audio(audio)
