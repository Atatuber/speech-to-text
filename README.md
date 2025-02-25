# speech-to-text

Speech (Recordings) to text (Readings) :D

Used pip libraries:

whisper
fastapi
redis
(py)torch
celery
uvicorn

(maybe more i forgot)

terminal order of commands:

    1.(venv) (folder: backend/src) celery -A celery_app worker --loglevel=info

    2. (folder: backend/src) redis active

    3. (folder: backend/src) uvicorn main:app --reload
