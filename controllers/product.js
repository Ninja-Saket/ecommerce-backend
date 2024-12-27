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

const handleQuery = async (req, res, query) => {
  const products = await Product.find({$text : {$search : query}}).populate('category').populate('subCategories').populate('ratings.postedBy').exec()
  return products
}

/**
 *  List products after applying search filters
 */
const listWithSearchFilters = async (req, res) => {
  const {query, price} = req.body
  if(query){
    const result = await handleQuery(req, res, query)
    res.json(result)
  }else if(query == ''){
    const result = await Product.find().exec();
    res.json(result)
  }
}

export { create, update, list, read, remove, sortedList, productsCount, productStar, listRelated, listRelatedByCategory, listRelatedBySubCategory, listWithSearchFilters};
