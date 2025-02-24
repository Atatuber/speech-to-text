from fastapi import FastAPI
from celery.result import AsyncResult
from celery_app import background_task, celery_app

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "FastAPI with Celery"}

@app.post("/task/{x}/{y}")
async def run_task(x: int, y: int):
    task = background_task.delay(x, y)
    return {"task_id": task.id, "status": "Task submitted"}

@app.get("/task/{task_id}")
async def get_task_status(task_id: str):
    result = AsyncResult(task_id, app=celery_app)
    return {"task_id": task_id, "status": result.status, "result": result.result}
