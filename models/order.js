import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema;

const orderSchema = new mongoose.Schema({
    products : [
        {
            product : {
                type : ObjectId,
                ref : 'Product'
            },
            count : Number,
            color : String,
            price : Number
        }
    ],
    paymentData : {},
    orderStatus : {
        type : String,
        default : "Not Processed",
        enum : [
            "Not Processed",
            "Processing",
            "Dispatched",
            "Cancelled",
            "Completed",
            "Cash On Delivery"
        ]
    },
    orderedBy : {
        type : ObjectId,
        ref : 'User'
    }
}, {timestamps : true})

const Order = mongoose.model('Order', orderSchema);
export default Order;
