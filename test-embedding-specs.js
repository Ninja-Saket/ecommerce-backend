import { getProductCollection } from './config/chromadb.js';

/**
 * Test script to verify keySpecifications are included in embeddings
 */

// Helper functions (copied from embeddingService.js for testing)
const camelCaseToLabel = (str) => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
};

const flattenSpecifications = (specs, prefix = '') => {
  let result = [];
  
  for (const [key, value] of Object.entries(specs)) {
    const label = camelCaseToLabel(key);
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nestedSpecs = flattenSpecifications(value, '');
      result.push(...nestedSpecs);
    } else {
      result.push(`${label}: ${value}`);
    }
  }
  
  return result;
};

const generateProductText = (product) => {
  const title = product.title || '';
  const description = product.description || '';
  const category = product.category?.name || '';
  const brand = product.brand || '';
  
  let text = `${title}. ${description}. Category: ${category}. Brand: ${brand}`;
  
  if (product.keySpecifications && Object.keys(product.keySpecifications).length > 0) {
    const specs = flattenSpecifications(product.keySpecifications);
    if (specs.length > 0) {
      text += '. ' + specs.join('. ');
    }
  }
  
  return text.trim();
};

// Test with sample product data
const sampleProduct = {
  title: "Dell Inspiron 14 Laptop",
  description: "Powerful laptop for students and professionals",
  category: { name: "Laptops" },
  brand: "Dell",
  keySpecifications: {
    "keySpecs": {
      "processor": "AMD Ryzen 7 7730U",
      "ram": "16GB DDR4",
      "storage": "512GB SSD",
      "graphics": "AMD Radeon Graphics",
      "display": "14-inch WUXGA (1920 × 1200)",
      "operatingSystem": "Windows 11"
    },
    "connectivity": "Wi-Fi 6, Bluetooth 5.2 || USB-C || 2 × USB-A || HDMI || SD card reader",
    "batteryAndBuild": {
      "battery": "56Wh",
      "weight": "1.46 kg",
      "build": "Slim aluminum finish"
    },
    "idealFor": "Students, office professionals, and daily multitasking"
  }
};

console.log('=== Testing keySpecifications Embedding Generation ===\n');
console.log('Sample Product:', JSON.stringify(sampleProduct, null, 2));
console.log('\n--- Generated Embedding Text ---');
const embeddingText = generateProductText(sampleProduct);
console.log(embeddingText);
console.log('\n--- Text Length ---');
console.log(`${embeddingText.length} characters`);
console.log('\n=== Test Complete ===');
