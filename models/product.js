import mongoose from "mongoose"
const {ObjectId} = mongoose.Schema

const productSchema = new mongoose.Schema({
    title : {
        type : String,
        trim : true,
        required : true,
        maxlength : 32,
        text : true
    },
    slug : {
        type : String,
        unique : true,
        lowercase : true,
        index : true
    },
    description : {
        type : String,
        required : true,
        maxlength : 2000,
        text : true
    },
    price : {
        type : Number,
        required : true,
    },
    category : {
        type : ObjectId,
        ref : 'Category'
    },
    subCategories : [{
        type : ObjectId,
        ref : 'SubCategory'
    }],
    quantity : Number,
    sold : {
        type : Number,
        default : 0
    },
    images : {
        type : Array
    },
    shipping : {
        type : String,
        enum : ["Yes", "No"]
    },
    color : {
        type : String,
        enum : ["Black", "Brown", "Silver", "White", "Blue"]
    },
    brand : {
        type : String,
        enum : ["Apple", "Samsung", "Microsoft", "Lenovo", "Asus", "Dell"]
    },
    ratings : [
        {
            star : Number,
            postedBy : {
                type : ObjectId,
                ref : "User"
            }
        }
    ]
}, {timestamps : true})

productSchema.index({
    title : 'text',
    description : 'text'
})

const Product = mongoose.model('Product', productSchema)
export default Product