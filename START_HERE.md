# Quick Start - ChromaDB Integration

## 1. Install Required Package

```bash
# Install the default embedding package (one-time)
npm install chromadb-default-embed
```

## 2. Start ChromaDB Server (Terminal 1)

```bash
# Using Docker (recommended - no Python needed)
docker run -p 8001:8000 chromadb/chroma

# OR using Python
pip install chromadb
chroma run --path ./chroma_data --port 8001
```

You should see: `Running on http://localhost:8001`

## 3. Start Your Node.js Server (Terminal 2)

```bash
# In a separate terminal
npm start
```

Your server will connect to ChromaDB automatically!

## That's It!

Your semantic search is now ready to use:
- ChromaDB server: `http://localhost:8001`
- Node.js server: `http://localhost:8000`
- Uses all-MiniLM-L6-v2 model (free, open-source)
- No API keys needed!

## Test It

```bash
node test-chromadb.js
```
