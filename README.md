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

## Prerequisites

- Node.js and npm
- Python 3.8 or higher
- Redis server (pre-installed on Arch Linux or available through package manager)
- NVIDIA GPU with CUDA support (for optimal performance)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a Python virtual environment:

   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:

   ```bash
   source venv/bin/activate  # On Unix/Linux
   # OR
   venv\Scripts\activate  # On Windows
   ```

4. Install required Python packages:
   ```bash
   pip install whisper whisper-openai python-dotenv fastapi uvicorn celery redis
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install the required npm packages:
   ```bash
   npm i
   ```

## Running the Application

You can start all components of the application using the provided bash script from the root directory:

```bash
bash start-up.bash
```

This script will:

- Start the FastAPI backend server
- Initialize the Celery worker for processing transcription tasks
- Launch the frontend development server

Once everything is running, access the application at http://localhost:3000

## Manual Startup (if not using the script)

### Backend

```bash
cd backend
source venv/bin/activate
cd src
uvicorn main:app --reload
```

### Celery Worker

WINDOWS:

```bash
cd backend
source venv/bin/activate
cd src
celery -A celery_app worker --loglevel=info --pool=solo
```

LINUX:

```bash
cd backend
source venv/bin/activate
cd src
celery -A celery_app worker --loglevel=info
```

### Frontend

```bash
cd frontend
npm run dev
```

## Troubleshooting

- **Redis connection issues**: Make sure Redis server is running (`redis-server`)
- **Worker can't access GPU**: Ensure that your CUDA drivers are properly installed
- **Audio recording issues**: Check browser permissions for microphone access
