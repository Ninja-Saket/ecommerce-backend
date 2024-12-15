import SubCategory from "../models/subCategory.js"
import slugify from 'slugify'

const create = async (req, res) => {
    try{
        const {name, parent } = req.body
        const subCategory = await new SubCategory({name, parent, slug : slugify(name)}).save()
        res.json(subCategory)
     }catch(err){
        res.status(400).send('Create subCategory failed')
    }
}

const list = async (req, res) => {
    try{
        const subCategories = await SubCategory.find({}).sort({createdAt : -1}).exec();
        res.json(subCategories)
    }catch(err){
        res.status(400).send('Fetch subCategory failed')
    }
}

const read = async (req, res) => {
    try{
        const subCategory = await SubCategory.findOne({slug : req.params.slug}).exec();
        res.json(subCategory)
    }catch(err){
        res.status(400).send('Fetch specified subCategory failed')
    }
}

const update = async (req, res) => {
    try{
        const {name, parent} = req.body
        const subCategory = await SubCategory.findOneAndUpdate({slug : req.params.slug}, {name, parent, slug : slugify(name)}, {new: true})
        res.json(subCategory)
    }catch(err){
        res.status(400).send('Update specific subCategory failed');
    }
}

const remove = async (req, res) => {
    try{
        const subCategory = await SubCategory.findOneAndDelete({slug : req.params.slug}).exec()
        res.json(subCategory)
    }catch(err){
        res.status(400).send('Delete specific subCategory failed')
    }
}

export {
    create,
    list,
    read,
    update, 
    remove
}