from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from celery.result import AsyncResult
from celery_app import celery_app, transcribe_given_audio
from transcriber import sanitize_filename
import os
import shutil
import re

def sanitize_filename(filename: str) -> str:
    filename = filename.strip()
    filename = re.sub(r"\s+", "_", filename)  
    filename = re.sub(r"[^a-zA-Z0-9_.-]", "", filename)
    return filename.lower()

app = FastAPI()

UPLOAD_DIR = "recordings/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "FastAPI with Celery"}

@app.post("/upload/")
async def upload_audio(file: UploadFile = File(...)):
    sani_filename = sanitize_filename(file.filename)

    file_path = f"{UPLOAD_DIR}{sani_filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    task = transcribe_given_audio.delay(file_path)

    return { "task_id": task.id, "status": "Task submitted", "filename": sani_filename}

@app.get("/upload/{task_id}")
async def get_uploaded_audio_result(task_id: str):
    result = AsyncResult(task_id, app=celery_app)

    return {"task_id": task_id, "status": result.status, "result": result.result}


    



