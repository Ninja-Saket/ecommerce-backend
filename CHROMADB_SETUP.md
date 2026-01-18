# ChromaDB Integration - Quick Start Guide

## Overview

This integration uses **ChromaDB's default open-source embedding function** powered by **SentenceTransformers** (all-MiniLM-L6-v2 model). This means:
- ✅ **Completely FREE** - No API costs
- ✅ **No API keys required** - Works out of the box
- ✅ **Runs locally** - Your data stays private
- ✅ **Open-source** - Full transparency

## Setup Instructions

### 1. Install and Start ChromaDB Server

ChromaDB requires a server to be running. Install and start it:

```bash
# Install ChromaDB (Python required)
pip install chromadb

# Start ChromaDB server on port 8001 (your Node.js server uses 8000)
chroma run --path ./chroma_data --port 8001
```

**Alternative: Using Docker**
```bash
docker pull chromadb/chroma
docker run -p 8001:8000 -v $(pwd)/chroma_data:/chroma/chroma chromadb/chroma
```

The server will:
- Run on `http://localhost:8001` (avoiding conflict with your Node.js server on port 8000)
- Store data in `./chroma_data` directory
- Use SentenceTransformers (all-MiniLM-L6-v2) for embeddings

### 2. Start Your Node.js Server

In a separate terminal, start your application:

```bash
npm start
```

Your server will automatically:
- Connect to ChromaDB at `http://localhost:8000`
- Create the product embeddings collection
- Use open-source SentenceTransformers for embeddings

**That's it!** No API keys or additional configuration needed.

### 3. Sync Existing Products (First Time Setup)

If you have existing products in your database, sync them to ChromaDB:

```bash
curl -X POST http://localhost:8000/api/product/sync-embeddings \
  -H "Content-Type: application/json" \
  -H "authtoken: YOUR_ADMIN_TOKEN"
```

## API Endpoints

### Semantic Search
Search for products using natural language:

```bash
POST /api/product/semantic-search
Content-Type: application/json

{
  "query": "laptop for gaming",
  "limit": 10
}
```

### Sync Embeddings (Admin Only)
Manually sync all products to ChromaDB:

```bash
POST /api/product/sync-embeddings
Content-Type: application/json
Headers: authtoken: YOUR_ADMIN_TOKEN
```

## How It Works

### Open-Source Embedding Function

ChromaDB uses **SentenceTransformers** by default, specifically the `all-MiniLM-L6-v2` model:
1. **Automatically generates embeddings** when you add documents
2. **Automatically generates query embeddings** when you search
3. **Runs locally** on your ChromaDB server - no external API calls
4. **No costs** - completely free and open-source

### Automatic Sync

When you create, update, or delete a product:
1. Product data is combined (title, description, category, brand)
2. ChromaDB automatically generates the embedding using SentenceTransformers
3. Embedding is stored with metadata for fast retrieval

### Semantic Search

When a user searches:
1. Query text is sent to ChromaDB
2. ChromaDB automatically generates query embedding locally
3. ChromaDB finds similar vectors using cosine similarity
4. Results are returned with similarity scores

## Benefits

✅ **FREE** - No API costs, ever  
✅ **Private** - All processing happens locally  
✅ **Fast** - No network latency for API calls  
✅ **Simple** - No API keys to manage  
✅ **Open-Source** - Full control and transparency  
✅ **Offline** - Works without internet connection

## About the Model

**all-MiniLM-L6-v2** is a lightweight, efficient SentenceTransformer model:
- 384-dimensional embeddings (vs 1536 for OpenAI)
- Excellent for semantic similarity tasks
- Fast inference on CPU
- Widely used and battle-tested

## Configuration

### Environment Variables

You can customize the ChromaDB connection:

```bash
# Optional: Custom ChromaDB server URL (defaults to http://localhost:8000)
CHROMA_URL=http://localhost:8000
```

## Troubleshooting

**Error: "Invalid URL" or connection refused**
- Make sure ChromaDB server is running: `chroma run --path ./chroma_data`
- Check that it's running on port 8000
- Verify the URL in your configuration

**Error: "Module not found: chromadb"**
- Install ChromaDB: `pip install chromadb`

## Example Queries

The semantic search understands meaning and context:

- "affordable smartphone with good camera"
- "gaming laptop under $1500"
- "wireless headphones for running"
- "professional office desk setup"

The semantic search understands meaning and context, not just keywords!
