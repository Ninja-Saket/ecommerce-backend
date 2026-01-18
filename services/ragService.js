import { semanticSearchProducts } from './embeddingService.js';
import Product from '../models/product.js';

/**
 * RAG Service for AI Shopping Assistant
 * Combines ChromaDB semantic search with LLM generation
 */

/**
 * Format product specifications for LLM prompt
 */
const formatSpecifications = (specs) => {
  if (!specs || Object.keys(specs).length === 0) return 'N/A';
  
  const formatValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
    }
    return value;
  };
  
  return Object.entries(specs)
    .map(([key, value]) => `${key}: ${formatValue(value)}`)
    .join('; ');
};

/**
 * Build prompt for LLM with product context
 */
const buildPrompt = (userQuery, products) => {
  const productContext = products.map((product, index) => {
    const specs = formatSpecifications(product.keySpecifications);
    const price = product.price ? `$${product.price}` : 'Price not available';
    
    return `${index + 1}. ${product.title} - ${price}
   Category: ${product.category?.name || 'N/A'}
   Brand: ${product.brand || 'N/A'}
   Specifications: ${specs}
   Description: ${product.description || 'No description available'}`;
  }).join('\n\n');
  
  return `You are a helpful shopping assistant for an e-commerce store. Your role is to recommend products based on customer needs.

User Query: "${userQuery}"

Relevant Products Found:
${productContext}

Task: Provide a helpful recommendation that:
1. Identifies which product(s) best match the user's needs
2. Explains WHY they're suitable (reference specific specifications)
3. Mentions any important trade-offs or considerations
4. Keeps the response friendly, concise, and easy to understand (2-3 paragraphs maximum)

Do not make up information. Only recommend products from the list above.`;
};

/**
 * Call LLM API (Groq)
 */
const callGroqLLM = async (prompt) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not found in environment variables');
  }
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile', // Updated model (3.1 was decommissioned)
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
};

/**
 * Main RAG function - combines retrieval and generation
 */
export const generateAssistantResponse = async (userQuery, conversationHistory = []) => {
  try {
    // Step 1: Retrieve relevant products using ChromaDB semantic search
    const embeddingResults = await semanticSearchProducts(userQuery, 5);
    
    // Step 2: Fetch full product details from MongoDB
    const productIds = embeddingResults.map(r => r.productId);
    const productsFromDB = await Product.find({ _id: { $in: productIds } })
      .populate('category')
      .populate('subCategories')
      .exec();
    
    // Create a map for quick lookup
    const productMap = new Map();
    productsFromDB.forEach(product => {
      productMap.set(product._id.toString(), product);
    });
    
    // Combine results preserving order from embeddingResults
    const products = embeddingResults.map(embeddingResult => {
      const product = productMap.get(embeddingResult.productId);
      if (!product) return null;
      
      return {
        ...product.toObject(),
        similarityScore: 1 - embeddingResult.distance,
        distance: embeddingResult.distance
      };
    }).filter(Boolean);
    
    console.log('Products for RAG:', products.map(p => ({ title: p.title, price: p.price })));
    
    // Step 3: Build prompt with product context
    const prompt = buildPrompt(userQuery, products);
    
    // Step 4: Generate response using LLM
    const llmResponse = await callGroqLLM(prompt);
    
    console.log('LLM Response:', llmResponse);
    
    // Step 5: Return response with top products for display
    return {
      text: llmResponse,
      products: products.slice(0, 3), // Return top 3 products for display
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('RAG Service Error:', error);
    throw error;
  }
};
