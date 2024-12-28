import Product from "../models/product.js";
import User from "../models/user.js";
import slugify from "slugify";

const create = async (req, res) => {
  try {
    req.body.slug = slugify(req.body.title);
    const newProduct = await new Product(req.body).save();
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

export { create, update, list, read, remove, sortedList, productsCount, productStar, listRelated, listRelatedByCategory, listRelatedBySubCategory, listWithSearchFilters};
