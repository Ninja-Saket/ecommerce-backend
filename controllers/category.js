import Category from "../models/category.js"
import slugify from 'slugify'

const create = async (req, res) => {
    try{
        const {name} = req.body
        const category = await new Category({name, slug : slugify(name)}).save()
        res.json(category)
     }catch(err){
        res.status(400).send('Create category failed')
    }
}

const list = async (req, res) => {
    try{
        const result = await Category.find({}).sort({createdAt : -1}).exec();
        console.log(result)
        res.json(result)
    }catch(err){
        res.status(400).send('Fetch category failed')
    }
}

const read = async (req, res) => {
    try{
        const category = await Category.findOne({slug : req.params.slug}).exec();
        res.json(category)
    }catch(err){
        res.status(400).send('Fetch specified category failed')
    }
}

const update = async (req, res) => {
    try{
        const {name} = req.body
        const category = await Category.findOneAndUpdate({slug : req.params.slug}, {name, slug : slugify(name)}, {new: true})
        res.json(category)
    }catch(err){
        res.status(400).send('Update specific category failed');
    }
}

const remove = async (req, res) => {
    try{
        const category = await Category.findOneAndDelete({slug : req.params.slug}).exec()
        res.json(category)
    }catch(err){
        res.status(400).send('Delete specific category failed')
    }
}

export {
    create,
    list,
    read,
    update, 
    remove
}