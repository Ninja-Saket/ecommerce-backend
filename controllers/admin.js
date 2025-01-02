import Order from '../models/order.js'

const getOrders = async (req, res) => {
    try{
        const orders = await Order.find({}).sort({"createdAt" : -1}).populate("products.product").exec();
        res.json(orders)
    }catch(err){
        console.log(err)
        res.status(400).json({
            err : err.message
        })
    }

}

const orderStatus = async (req, res) => {
    try{
        const {orderId, orderStatus} = req.body
        const updated = await Order.findByIdAndUpdate(orderId, {orderStatus}, {new : true}).exec()
        res.json(updated)
    }catch(err){
        console.log(err)
        res.status(400).json({
            err : err.message
        })
    }
}

export {getOrders, orderStatus}