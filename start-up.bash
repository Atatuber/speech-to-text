#!/bin/bash

# Define colors for better output readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Store the base directory
BASE_DIR=$(pwd)

# Function to display a section header
section() {
  echo -e "\n${BLUE}==== $1 ====${NC}"
}

# Function to run a command in a specific directory
run_in_dir() {
  local dir=$1
  local cmd=$2
  local name=$3
  
  echo -e "${GREEN}Starting $name in $dir${NC}"
  cd "$BASE_DIR/$dir" || { echo "Failed to change to directory $dir"; exit 1; }
  echo "$ $cmd"
  eval "$cmd" &
  PID=$!
  echo "${name} started with PID: $PID"
  cd "$BASE_DIR" || { echo "Failed to return to base directory"; exit 1; }
}

# Trap Ctrl+C to kill all background processes when script is terminated
trap 'echo "Shutting down all processes..."; kill $(jobs -p) 2>/dev/null; exit' INT

section "Starting Backend and Services"

# Activate the existing virtual environment in the backend folder
run_in_dir "backend" "source venv/bin/activate && cd src && uvicorn main:app --reload" "FastAPI backend"

# Start Celery worker with the same virtual environment
run_in_dir "backend" "source venv/bin/activate && cd src && celery -A celery_app worker --loglevel=info" "Celery worker"

section "Starting Frontend"

# Start Frontend (install dependencies if needed and run dev server)
run_in_dir "frontend" "npm install && npm run dev" "Frontend development server"

section "All Services Started"
echo "Your application is now running!"
echo "Press Ctrl+C to shut down all services"

# Wait for all background processes to finish
# (which won't happen unless they crash or are killed)
wait