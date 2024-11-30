import User from "../models/user.js"
const createOrUpdateUser = async (req, res) => {
    const {email} = req.user
    const name = email.split('@')[0];
    const user = await User.findOneAndUpdate({email}, {email, name}, {new : true})
    if(user){
        console.log('USER UPDATED', user)
        res.json(user)
    }else{
        const newUser = await new User({
            email,
            name
        }).save()
        console.log('USER CREATED', newUser)
        res.json(newUser)
    }
}

const currentUser = async(req, res) => {
    const user = await User.findOne({email : req.user.email})
    if(user){
        return res.json(user)
    }else{
        return res.status(401).json({
            err : 'User not exist'
        })
    }
}
export {createOrUpdateUser, currentUser}