import Coupon from "../models/coupon.js";
const create = async (req, res) => {
  try {
    const { name, expiry, discount } = req.body;
    const result = await new Coupon({ name, expiry, discount }).save();
    res.json(result);
  } catch (err) {
    console.log(err);
  }
};

const remove = async (req, res) => {
  try {
    const result = await Coupon.findByIdAndDelete(req.params.couponId).exec();
    res.json(result);
  } catch (err) {
    console.log(err);
  }
};

const list = async (req, res) => {
  try {
    const result = await Coupon.find({}).sort({ createdAt: -1 }).exec();
    res.json(result);
  } catch (err) {
    console.log(err);
  }
};

export { create, remove, list };
