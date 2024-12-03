import admin from '../firebase/index.js'
import User from '../models/user.js'
// Validate the user token and pass the userdata to controller (if token is valid)
const authCheck = async (req, res, next) => {
    try{
        const firebaseUser = await admin.auth().verifyIdToken(req.headers.authtoken)
        console.log('Firebase User in Auth Check', firebaseUser)
        req.user = firebaseUser
        next()
    }catch(err){
        console.log(err)
        res.status(401).json({
            err : 'Invalid or expired token'
        })
    }
}
// Validate the admin user and pass the userdata to controller 
const adminCheck = async (req, res, next) => {
    const {email} = req.user;
    const adminUser = await User.findOne({email}).exec()
    if(adminUser && adminUser.role === 'admin'){
        next()
    }else{
        res.status(403).json({
            err : 'Admin resource. Access Denied'
        })
    }
}
export {
    authCheck,
    adminCheck
}