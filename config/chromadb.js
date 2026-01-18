import { ChromaClient } from 'chromadb'

// Initialize ChromaDB client
const client = new ChromaClient({
  ssl: false,
  host: process.env.CHROMADB_HOST,
  port: process.env.CHROMADB_PORT,
  headers: {},
})

const COLLECTION_NAME = 'product_embeddings'

/**
 * Get or create the product embeddings collection
 * ChromaDB default embedding function (all-MiniLM-L6-v2)
 */
export const getProductCollection = async () => {
  try {
    const collection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
      metadata: {
        description: 'Product embeddings for semantic search using open-source SentenceTransformers (all-MiniLM-L6-v2)',
        'hnsw:space': 'cosine'
      }
    });
    return collection;
  } catch (error) {
    console.error('Error getting/creating ChromaDB collection:', error);
    throw error;
  }
};

/**
 * Initialize ChromaDB connection
 */
export const initChromaDB = async () => {
  try {
    const heartbeat = await client.heartbeat();
    console.log('ChromaDB connected successfully. Heartbeat:', heartbeat);
    await getProductCollection();
    console.log(`ChromaDB collection "${COLLECTION_NAME}" ready`);
    return true;
  } catch (error) {
    console.error('Failed to initialize ChromaDB:', error);
    return false;
  }
};

export default client;
