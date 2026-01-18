// Test script for ChromaDB integration
import { initChromaDB } from './config/chromadb.js';
import { 
  addProductEmbedding, 
  semanticSearchProducts 
} from './services/embeddingService.js';

// Mock product for testing
const mockProduct = {
  _id: 'test123',
  title: 'Apple MacBook Pro 16-inch',
  description: 'Powerful laptop with M3 chip, perfect for professional work and creative tasks',
  price: 2499,
  brand: 'Apple',
  category: { name: 'Laptops' },
  slug : "apple-macbook-pro-16-inch"
};

async function testChromaDB() {
  console.log('🧪 Testing ChromaDB Integration with Open-Source Embeddings...\n');
  
  try {
    // Test 1: Initialize ChromaDB
    console.log('1️⃣ Testing ChromaDB initialization...');
    const initialized = await initChromaDB();
    if (initialized) {
      console.log('✅ ChromaDB initialized successfully with SentenceTransformers (all-MiniLM-L6-v2)\n');
    } else {
      throw new Error('ChromaDB initialization failed');
    }
    
    // Test 2: Add embedding (ChromaDB will auto-generate using SentenceTransformers)
    console.log('2️⃣ Testing automatic embedding generation and storage...');
    console.log('   ChromaDB will automatically generate embeddings using SentenceTransformers');
    console.log('   Model: all-MiniLM-L6-v2 (384-dimensional embeddings)');
    await addProductEmbedding(mockProduct);
    console.log('✅ Product embedding added successfully\n');
    
    // Test 3: Semantic search (ChromaDB will auto-generate query embedding)
    console.log('3️⃣ Testing semantic search...');
    const searchQuery = 'laptop for professional work';
    console.log(`   Query: "${searchQuery}"`);
    console.log('   ChromaDB will automatically generate query embedding locally');
    const results = await semanticSearchProducts(searchQuery, 5);
    console.log(`✅ Found ${results.length} results:`);
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.metadata.title} (similarity: ${(1 - result.distance).toFixed(3)})`);
    });
    
    console.log('\n🎉 All tests passed!');
    console.log('\n✨ Benefits of using open-source SentenceTransformers:');
    console.log('   • Completely FREE - no API costs');
    console.log('   • No API keys required');
    console.log('   • Runs locally - your data stays private');
    console.log('   • Fast - no network latency');
    console.log('   • Works offline');
    
    console.log('\n📝 Next steps:');
    console.log('   1. Start the server with: npm start');
    console.log('   2. Sync existing products with: POST /api/product/sync-embeddings');
    console.log('   3. Try semantic search with: POST /api/product/semantic-search');
    console.log('\n💡 No API keys needed - just start using it!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Tip: Make sure ChromaDB is properly installed');
    process.exit(1);
  }
}

testChromaDB();
