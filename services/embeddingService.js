import { getProductCollection } from '../config/chromadb.js';

/**
 * Convert camelCase to readable label
 * e.g., "idealFor" -> "Ideal For", "batteryAndBuild" -> "Battery And Build"
 */
const camelCaseToLabel = (str) => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
};

/**
 * Flatten nested specifications into readable text
 */
const flattenSpecifications = (specs, prefix = '') => {
  let result = [];
  
  for (const [key, value] of Object.entries(specs)) {
    const label = camelCaseToLabel(key);
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively flatten nested objects
      const nestedSpecs = flattenSpecifications(value, '');
      result.push(...nestedSpecs);
    } else {
      // Add the key-value pair
      result.push(`${label}: ${value}`);
    }
  }
  
  return result;
};

/**
 * Generate embedding text from product data
 */
const generateProductText = (product) => {
  const title = product.title || '';
  const description = product.description || '';
  const category = product.category?.name || '';
  const brand = product.brand || '';
  
  // Start with basic product info
  let text = `${title}. ${description}. Category: ${category}. Brand: ${brand}`;
  
  // Add key specifications if available
  if (product.keySpecifications && Object.keys(product.keySpecifications).length > 0) {
    const specs = flattenSpecifications(product.keySpecifications);
    if (specs.length > 0) {
      text += '. ' + specs.join('. ');
    }
  }
  
  return text.trim();
};

/**
 * Add product embedding to ChromaDB
 */
export const addProductEmbedding = async (product) => {
  try {
    const collection = await getProductCollection();
    const text = generateProductText(product);
    
    console.log(`Generated embedding text for "${product.title}":`, text);
    
    await collection.add({
      ids: [product._id.toString()],
      metadatas: [{
        title: product.title,
        slug: product.slug,
        price: product.price,
        category: product.category?.name || '',
        brand: product.brand || ''
      }],
      documents: [text]
    });
    
    console.log(`Added embedding for product: ${product.title}`);
    return true;
  } catch (error) {
    console.error('Error adding product embedding:', error);
    throw error;
  }
};

/**
 * Update product embedding in ChromaDB
 */
export const updateProductEmbedding = async (product) => {
  try {
    await deleteProductEmbedding(product._id.toString());
    await addProductEmbedding(product);
    
    console.log(`Updated embedding for product: ${product.title}`);
    return true;
  } catch (error) {
    console.error('Error updating product embedding:', error);
    throw error;
  }
};

/**
 * Delete product embedding from ChromaDB
 */
export const deleteProductEmbedding = async (productId) => {
  try {
    const collection = await getProductCollection();
    
    await collection.delete({
      ids: [productId.toString()]
    });
    
    console.log(`Deleted embedding for product ID: ${productId}`);
    return true;
  } catch (error) {
    // Ignore errors if embedding doesn't exist
    if (error.message?.includes('not found')) {
      return true;
    }
    console.error('Error deleting product embedding:', error);
    throw error;
  }
};

/**
 * Perform semantic search on products
 */
export const semanticSearchProducts = async (query, limit = 10) => {
  try {
    const collection = await getProductCollection();
    
    const results = await collection.query({
      queryTexts: [query],
      nResults: limit
    });
    
    // Format results
    const products = results.ids[0].map((id, index) => ({
      productId: id,
      metadata: results.metadatas[0][index],
      distance: results.distances[0][index],
      document: results.documents[0][index]
    }));
    
    return products;
  } catch (error) {
    console.error('Error performing semantic search:', error);
    throw error;
  }
};

/**
 * Sync all products to ChromaDB
 */
export const syncAllProducts = async (products) => {
  try {
    let successCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      try {
        await addProductEmbedding(product);
        successCount++;
      } catch (error) {
        console.error(`Failed to sync product ${product._id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Sync complete. Success: ${successCount}, Errors: ${errorCount}`);
    return { successCount, errorCount, total: products.length };
  } catch (error) {
    console.error('Error syncing products:', error);
    throw error;
  }
};

