import {v2 as cloudinary} from 'cloudinary'

// config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const upload = async (req, res) => {
    try{
        const result = await cloudinary.uploader.upload(req.body.image, {
            public_id : `${Date.now()}`,
            resource_type : 'auto'
        })
        res.json({
            public_id : result.public_id,
            url : result.secure_url
        })
    }catch(err){
        res.status(400).send('Upload cloudinary image failed')
    }
}

const remove = async (req, res) => {
    try{
        let image_id = req.body.public_id
        const result = await cloudinary.uploader.destroy(image_id)
        return res.send("Ok")
    }catch(err){
        return res.status(400).send('Remove cloudinary image failed')
    }
}

export {
    upload, 
    remove
}