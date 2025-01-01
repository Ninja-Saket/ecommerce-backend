import User from "../models/user.js"
import Product from '../models/product.js'
import Cart from '../models/cart.js'
import Coupon from '../models/coupon.js'
import Razorpay from 'razorpay'
import crypto from 'crypto'

const PaymentInstance = new Razorpay({
    key_id : process.env.RAZORPAY_API_KEY,
    key_secret : process.env.RAZORPAY_API_SECRET
})

const createRazorpayOrder = async (req, res)=> {
    console.log(req.body)
    const {couponApplied} = req.body;
    // 1. Find the user
    const user = await User.findOne({email : req.user.email}).exec()
    // 2. Get user cart total and total after discount
    const {cartTotal, totalAfterDiscount} = await Cart.findOne({
        orderedBy : user._id
    }).exec()
    console.log('Cart Total -> ', cartTotal)
    console.log('Total After Discount -> ', totalAfterDiscount)

    let finalAmount = cartTotal * 100;
    if(couponApplied && totalAfterDiscount){
        finalAmount = totalAfterDiscount*100
    }
    // calculate amount here later
    const options = {
        amount : finalAmount,
        currency : "INR"
    }
    const order = await PaymentInstance.orders.create(options)
    console.log('Order ---> ', order, null, 4)
    res.status(200).send({
        success : true,
        order
    })
}

const verifyPayment = async (req, res)=> {
    console.log('Request body -->', req.body)
    const {razorpay_payment_id, razorpay_order_id, razorpay_signature} = req.body
    const body = `${razorpay_order_id}|${razorpay_payment_id}`

    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET).update(body.toString()).digest('hex')
    console.log('Signature received --> ', razorpay_signature)
    console.log('Expected Signature --> ', expectedSignature)
    const isAuthentic =  expectedSignature === razorpay_signature
    console.log('Authentic',isAuthentic)
    if(isAuthentic){
        res.redirect(`${process.env.ECOMMERCE_URL}/user/paymentsuccess?reference=${razorpay_payment_id}`)
    }else{
        res.status(400).send({
            success : false
        })
    }
    
}

export {createRazorpayOrder, verifyPayment}