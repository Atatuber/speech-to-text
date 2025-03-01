from celery import Celery
from transcriber import transcribe_audio

celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0", 
)

@celery_app.task
def transcribe_given_audio(audio):
    return transcribe_audio(audio)
