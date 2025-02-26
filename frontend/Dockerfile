# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
