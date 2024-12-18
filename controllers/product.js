import Product from "../models/product.js";
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

const update = async (req, res) => {};

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

const read = async (req, res) => {};

const remove = async (req, res) => {};

export { create, update, list, read, remove };
