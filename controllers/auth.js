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

export {createOrUpdateUser}