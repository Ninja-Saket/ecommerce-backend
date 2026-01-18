# ChromaDB Server Setup - Quick Start

## The Issue

ChromaDB JavaScript client connects to a ChromaDB **server**, not a local file path. You need to run the ChromaDB server separately.

## Quick Setup (Choose One Method)

### Method 1: Using Python (Recommended)

```bash
# Install ChromaDB
pip install chromadb

# Start the server on port 8001 (your Node.js server uses 8000)
chroma run --path ./chroma_data --port 8001
```

### Method 2: Using Docker

```bash
# Pull the image
docker pull chromadb/chroma

# Run the container (map port 8001 to avoid conflict)
docker run -p 8001:8000 -v $(pwd)/chroma_data:/chroma/chroma chromadb/chroma
```

## Then Start Your Node.js Server

In a **separate terminal**:

```bash
npm start
```

## Verify It's Working

1. ChromaDB server should show: `Running on http://localhost:8001`
2. Your Node.js server should connect without errors
3. Test with: `node test-chromadb.js`

## Configuration

The default URL is `http://localhost:8000`. To change it, set:

```bash
# In your .env file
CHROMA_URL=http://localhost:8001
```

## Troubleshooting

**Error: "Invalid URL" or "Connection refused"**
- Make sure ChromaDB server is running first
- Check it's on port 8001
- Try: `curl http://localhost:8001/api/v1/heartbeat`

**Error: "chroma: command not found"**
- Install ChromaDB: `pip install chromadb`
- Or use Docker method instead

## Why a Server?

ChromaDB uses a client-server architecture:
- **Server**: Handles embeddings, storage, and search
- **Client** (your Node.js app): Sends requests to the server

This allows:
- Multiple clients to share the same data
- Better resource management
- Scalability for production
