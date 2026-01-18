# Docker Deployment Guide

## Quick Start

### 1. Build and Run with Docker Compose (Recommended)

```bash
# Copy environment template
cp .env.docker.example .env

# Edit .env with your actual credentials
nano .env

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f server

# Stop all services
docker-compose down
```

### 2. Build Docker Image Only

```bash
# Build the image
docker build -t ecommerce-server .

# Run the container
docker run -p 8000:8000 \
  --env-file .env \
  --name ecommerce-server \
  ecommerce-server
```

## Services

The docker-compose setup includes:

- **MongoDB** (port 27017): Database
- **ChromaDB** (port 8001): Vector database for semantic search
- **Node.js Server** (port 8000): API server

## Environment Variables

Required environment variables (see `.env.docker.example`):

- `DATABASE`: MongoDB connection string
- `CLOUDINARY_*`: Cloudinary credentials
- `FIREBASE_SERVICE_ACCOUNT`: Firebase admin SDK
- `RAZORPAY_*`: Payment gateway credentials
- `CHROMADB_URL`: ChromaDB connection URL
- `GROQ_API_KEY`: Groq LLM API key

## Useful Commands

```bash
# Rebuild services
docker-compose up -d --build

# View logs for specific service
docker-compose logs -f server
docker-compose logs -f mongodb
docker-compose logs -f chromadb

# Execute commands in container
docker-compose exec server npm run sync-embeddings

# Stop and remove all containers
docker-compose down

# Stop and remove all containers + volumes
docker-compose down -v

# Check service status
docker-compose ps
```

## Production Deployment

For production, consider:

1. Use Docker secrets for sensitive data
2. Set up proper logging and monitoring
3. Configure health checks
4. Use a reverse proxy (nginx)
5. Enable HTTPS
6. Set up automated backups for MongoDB

## Troubleshooting

### Container won't start
```bash
docker-compose logs server
```

### Reset everything
```bash
docker-compose down -v
docker-compose up -d
```

### Access MongoDB directly
```bash
docker-compose exec mongodb mongosh -u admin -p your_password
```
