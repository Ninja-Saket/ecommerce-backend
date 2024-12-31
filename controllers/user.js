import User from '../models/user.js'
import Product from '../models/product.js'
import Cart from '../models/cart.js'
import Coupon from '../models/coupon.js'

const createUserCart = async (req, res) => {
    const {cart} = req.body
    const user = await User.findOne({email : req.user.email}).exec()
    const products = []

    // check if cart with loggedin user already exist
    let userExistingCart = await Cart.findOne({orderedBy : user._id}).exec()

    if(userExistingCart){
        await Cart.findOneAndDelete(userExistingCart).exec()
    }

    for(let i = 0; i < cart.length; i++){
        let newCartItem = {}
        newCartItem.product = cart[i]._id
        newCartItem.count = cart[i].count
        newCartItem.color = cart[i].color

        // get price for creating total
        let product = await Product.findById(cart[i]._id).exec();
        newCartItem.price = product.price
        products.push(newCartItem)
    }
    
    let cartTotal = 0
    for(let i = 0; i < products.length; i++){
        cartTotal += products[i].price * products[i].count;
    }
    await new Cart({products, cartTotal, orderedBy : user._id}).save();
    res.json({ok : true})
}

const getUserCart = async (req, res) => {
    try{
        const user = await User.findOne({email : req.user.email}).exec()
        const cart = await Cart.findOne({orderedBy : user._id}).populate('products.product').exec()
        if(!cart || cart.length == 0){
            return res.json({products : [], cartTotal : 0, totalAfterDiscount : 0})
        }
        const {products, cartTotal, totalAfterDiscount} = cart
        return res.json({products, cartTotal, totalAfterDiscount})
    }catch(err){
        console.log(err)
        return res.json({products : [], cartTotal : 0, totalAfterDiscount : 0})
    }
}

const emptyUserCart = async (req, res) => {
    const user = await User.findOne({email : req.user.email}).exec()
    const cart = await Cart.findOneAndDelete({orderedBy : user._id}).exec()
    res.json(cart)
}

const saveUserAddress = async (req, res) => {
    await User.findOneAndUpdate({email : req.user.email}, {address : req.body.address}).exec()
    res.json({ok : true})
}

const applyCouponToUserCart = async (req, res)=> {
    try{
        const {coupon} = req.body
        const validCoupon = await Coupon.findOne({name : coupon}).exec()
        if(!validCoupon){
            return res.status(400).send({
                err : "Invalid coupon"
            })
        }
        const user = await User.findOne({email : req.user.email}).exec()
        const result = await Cart.findOne({orderedBy : user._id}).populate('products.product').exec()
        const cardTotal = result.cartTotal
        const totalAfterDiscount = (cardTotal - (cardTotal* validCoupon.discount)/100).toFixed(2)
        await Cart.findOneAndUpdate({
            orderedBy : user._id,
        }, {totalAfterDiscount}, {new : true})
        return res.json(totalAfterDiscount)
    }catch(err){
        console.log(err)
        return res.status(400).send({err : err.message})
    }
   
}
export {
    createUserCart,
    getUserCart,
    emptyUserCart,
    saveUserAddress,
    applyCouponToUserCart
}