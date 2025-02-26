# Audio Transcription Application

This application provides audio transcription services using OpenAI's Whisper model. It consists of a React frontend, FastAPI backend, Celery for task processing, and Redis for message passing.

## Features

- Upload MP3 files for transcription
- Record audio directly from the browser
- Real-time transcription status updates
- GPU-accelerated transcription with Whisper AI

## Architecture

- **Frontend**: React, Vite, and Tailwind CSS
- **Backend**: FastAPI
- **Task Queue**: Celery with Redis
- **Transcription**: OpenAI's Whisper model

## Setup with Docker

### Prerequisites

- Docker and Docker Compose installed
- NVIDIA GPU with CUDA support (for optimal performance)
- NVIDIA Container Toolkit installed (for GPU support)

### Directory Structure

```
project/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── backend/
│   ├── src/
│   │   └── recordings/
│   ├── main.py
│   ├── celery_app.py
│   ├── transcriber.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── Dockerfile.worker
└── docker-compose.yml
```

### Running the Application

1. Clone the repository and navigate to the project directory.

2. Start the application using Docker Compose:

```bash
docker-compose up -d
```

This will start all services:

- Frontend on http://localhost:3000
- Backend API on http://localhost:8000
- Redis server on port 6379
- Celery worker for processing transcription tasks

3. To stop the application:

```bash
docker-compose down
```

## Usage

1. Open your browser and navigate to http://localhost:3000
2. Upload an MP3 file or record audio directly in the browser
3. Submit the audio for transcription
4. Wait for the transcription to complete
5. View the transcription results

### GPU Configuration

The Celery worker uses NVIDIA GPU support. Make sure you have the NVIDIA Container Toolkit installed and configured correctly for Docker.

## Troubleshooting

- **Worker can't access GPU**: Ensure that NVIDIA Container Toolkit is properly installed and that your GPU is compatible with CUDA.
- **Audio recording issues**: Check browser permissions for microphone access.
