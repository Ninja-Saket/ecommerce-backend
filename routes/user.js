const express = require('express')
const router = express.Router()

// route
router.get('/user', (req, res) => {
    res.json({
        data : 'Hey you hit user end point'
    })
})

module.exports = router;
