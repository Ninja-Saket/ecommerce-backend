import admin from '../firebase/index.js'
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

export {
    authCheck
}