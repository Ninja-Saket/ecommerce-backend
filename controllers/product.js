import Product from "../models/product.js";
import User from "../models/user.js";
import slugify from "slugify";
import { 
  addProductEmbedding, 
  updateProductEmbedding, 
  deleteProductEmbedding,
  semanticSearchProducts,
  syncAllProducts
} from "../services/embeddingService.js";
import { generateAssistantResponse } from "../services/ragService.js";

const create = async (req, res) => {
  try {
    req.body.slug = slugify(req.body.title);
    const newProduct = await new Product(req.body).save();
    
    // Add embedding to ChromaDB (non-blocking)
    addProductEmbedding(newProduct).catch(err => 
      console.error('Failed to add embedding:', err)
    );
    
    res.json(newProduct);
  } catch (err) {
    console.log(err);
    res.status(400).send({
      err: err.message,
    });
  }
};

const update = async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.body._id },
      req.body,
      { new: true }
    ).exec();
    
    // Update embedding in ChromaDB (non-blocking)
    updateProductEmbedding(updatedProduct).catch(err => 
      console.error('Failed to update embedding:', err)
    );
    
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).send({ err: err.message });
  }
};

const list = async (req, res) => {
  try {
    const products = await Product.find({})
      .limit(parseInt(req.params.count))
      .populate("category")
      .populate("subCategories")
      .sort([["createdAt", "desc"]])
      .exec();
    res.json(products);
  } catch (err) {
    res.status(400).send("Fetch product failed");
  }
};

const read = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category")
      .populate("subCategories")
      .exec();
    res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Fetch Single Product Failed");
  }
};

const remove = async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({
      slug: req.params.slug,
    }).exec();
    
    // Delete embedding from ChromaDB (non-blocking)
    if (deleted) {
      deleteProductEmbedding(deleted._id).catch(err => 
        console.error('Failed to delete embedding:', err)
      );
    }
    
    res.json(deleted);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Product Delete Failed");
  }
};

const sortedList = async (req, res) => {
  try {
    const { sort, order, page } = req.body;
    const currentPage = page || 1;
    const perPage = 3;
    const products = await Product.find({})
      .skip((currentPage - 1) * perPage)
      .populate("category")
      .populate("subCategories")
      .sort([
        [sort, order],
        ["_id", "asc"],
      ])
      .limit(perPage)
      .exec();
    res.json(products);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Product fetch in sorted order failed");
  }
};

const productsCount = async (req, res) => {
  try {
    const totalProducts = await Product.find({})
      .estimatedDocumentCount()
      .exec();
    res.json(totalProducts);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Product count fetching failed");
  }
};

const productStar = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).exec();
    const user = await User.findOne({ email: req.user.email }).exec();
    const { star } = req.body;

    // check if currently logged in user have already added rating to this product
    let existingRatingObject = product.ratings.find(
      (rating) => rating.postedBy.toString() == user._id.toString()
    );

    // if user haven't left rating yet, push it
    if (existingRatingObject === undefined) {
      let ratingAdded = await Product.findByIdAndUpdate(
        product._id,
        {
          $push: {
            ratings: {
              star,
              postedBy: user._id,
            },
          },
        },
        { new: true }
      ).exec();
      console.log("Rating Added -> ", ratingAdded);
      res.json(ratingAdded);
    } else {
      // if user has already left rating update it
      const ratingUpdated = await Product.updateOne(
        {
          ratings: { $elemMatch: existingRatingObject },
        },
        {
          $set: { "ratings.$.star": star },
        },
        { new: true }
      ).exec();
      console.log("Rating Updated ->", ratingUpdated);
      res.json(ratingUpdated);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send("Product start rating post failed");
  }
};

/**
 * Returns a list of product related to given product (products have same category as given product)
 */
const listRelated = async(req, res) => {
  const product = await Product.findById(req.params.productId).exec()
  const related = await Product.find({
    _id : {$ne : product._id},
    category : product.category
  }).limit(3)
  .populate('category')
  .populate('subCategories')
  .populate('ratings.postedBy')
  .exec()

  res.json(related)
}


const listRelatedByCategory = async(req, res) => {
  const relatedProducts = await Product.find({category : req.params.categoryId}).populate('category').exec();
  res.json(relatedProducts)
}

const listRelatedBySubCategory = async(req, res) => {
  const relatedProducts = await Product.find({subCategories : req.params.subCategoryId}).populate('category').exec()
  res.json(relatedProducts)
}

const handleQuery = async (query) => {
  const products = await Product.find({$text : {$search : query}}).populate('category').populate('subCategories').populate('ratings.postedBy').exec()
  return products
}

const handlePrice = async(price) => {
  try{
    const products = await Product.find({
      price : {
        $gte : price[0],
        $lte : price[1]
      }
    }).populate('category').populate('subCategories').populate('ratings.postedBy').exec()
    return products;
  }catch(err){
    console.log(err)
  }
}

const handleCategory = async (category) => {
  try{
    const result = await Product.find({category : {$in : category}}).populate('category').populate('subCategories').populate('ratings.postedBy').exec()
    return result
  }catch(err){
    console.log(err)
  }
}

const handleStar = async(stars)=> {
  const pipeline = [
    {
      $project : {
        document : "$$ROOT",
        floorAverage : {
          $floor : {
            $avg : "$ratings.star"
          }
        }
      }
    },
    {
      $match : {floorAverage : stars}
    }, {
      $project : {
        _id : 1
      }
    }
  ]

  const aggresult = await Product.aggregate(pipeline)
  console.log('AggResult ',aggresult)
  const result = await Product.find({_id : { $in : aggresult}}).populate('category').populate('subCategories').populate('ratings.postedBy').exec()
  return result
}

const handleSubCategories = async (subCategory)=> {
  const result = await Product.find({subCategories : subCategory}).populate('category').populate('subCategories').populate('ratings.postedBy').exec()
  return result
}

const handleShipping = async(shipping)=> {
  const result = await Product.find({shipping}).populate('category').populate('subCategories').populate('ratings.postedBy').exec()
  return result
}

const handleColor = async (color) => {
  const result = await Product.find({color}).populate('category').populate('subCategories').populate('ratings.postedBy').exec()
  return result
}

const handleBrand = async (brand) => {
  const result = await Product.find({brand}).populate('category').populate('subCategories').populate('ratings.postedBy').exec()
  return result
}

/**
 *  List products after applying search filters
 */
const listWithSearchFilters = async (req, res) => {
  const {query, price, category, stars, subCategory, shipping, color, brand} = req.body
  if(!!query){
    const result = await handleQuery(query)
    res.json(result)
  }else if(!!price){
    console.log('Price :--> ', price)
    const result = await handlePrice(price)
    res.json(result)
  }else if(!!category){
    console.log('Category :--> ', category)
    const result = await handleCategory(category)
    res.json(result)
  }else if(!!stars){
    console.log('Stars :--> ', stars)
    const result = await handleStar(stars)
    res.json(result)
  }else if(!!subCategory){
    console.log('SubCategories :--> ', subCategory)
    const result = await handleSubCategories(subCategory)
    res.json(result)
  }else if(!!shipping){
    console.log('Shipping :-->', shipping)
    const result = await handleShipping(shipping)
    res.json(result)
  }else if(!!color){
    console.log('Color :-->', color)
    const result = await handleColor(color)
    res.json(result)
  }else if(!!brand){
    console.log('Brand :-->', brand)
    const result = await handleBrand(brand)
    res.json(result)
  }else{
    const result = await Product.find().exec();
    res.json(result)
  }
}

/**
 * Semantic search for products using vector embeddings
 */
const semanticSearch = async (req, res) => {
  try {
    const { query, limit = 3 } = req.body;
    
    if (!query) {
      const result = await Product.find().populate('category').populate('subCategories').populate('ratings.postedBy').exec();
      return res.json(result)
    }
    
    // Get semantic search results from ChromaDB
    const embeddingResults = await semanticSearchProducts(query, limit);
    
    // Fetch full product details from MongoDB
    const productIds = embeddingResults.map(r => r.productId);
    const products = await Product.find({ _id: { $in: productIds } })
      .populate('category')
      .populate('subCategories')
      .populate('ratings.postedBy')
      .exec();
    
    // Create a map for quick lookup
    const productMap = new Map();
    products.forEach(product => {
      productMap.set(product._id.toString(), product);
    });
    
    // Combine results with similarity scores, preserving order from embeddingResults
    const results = embeddingResults.map(embeddingResult => {
      const product = productMap.get(embeddingResult.productId);
      if (!product) return null;
      
      return {
        ...product.toObject(),
        similarityScore: 1 - embeddingResult.distance,
        distance: embeddingResult.distance
      };
    }).filter(Boolean); // Remove any null entries
    
    return res.json(results);
  } catch (err) {
    console.error('Semantic search error:', err);
    return res.status(400).send({ error: 'Semantic search failed', message: err.message });
  }
};

/**
 * Sync all products to ChromaDB
 */
const syncEmbeddings = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('category')
      .exec();
    
    const result = await syncAllProducts(products);
    
    res.json({
      message: 'Sync completed',
      ...result
    });
  } catch (err) {
    console.error('Sync embeddings error:', err);
    res.status(400).send({ error: 'Sync failed', message: err.message });
  }
};

/**
 * AI Shopping Assistant - RAG-based chat endpoint
 */
const chatAssistant = async (req, res) => {
  try {
    const { query, conversationHistory = [] } = req.body;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    console.log('Chat Assistant Query:', query);
    
    // Generate response using RAG (Retrieval-Augmented Generation)
    const response = await generateAssistantResponse(query, conversationHistory);
    
    res.json(response);
  } catch (err) {
    console.error('Chat assistant error:', err);
    res.status(500).json({ 
      error: 'Failed to generate response', 
      message: err.message 
    });
  }
};

export { create, update, list, read, remove, sortedList, productsCount, productStar, listRelated, listRelatedByCategory, listRelatedBySubCategory, listWithSearchFilters, semanticSearch, syncEmbeddings, chatAssistant};
