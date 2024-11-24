const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const {readdirSync} = require('fs')
require('dotenv').config()

// app
const app = express()

// db
mongoose.connect(process.env.DATABASE_URL).then(()=> console.log('Db connected!!'))
.catch((err)=> console.log('Db connection error', err))


// middlewares
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cors())
// routes middleware
readdirSync('./routes').map((r)=> app.use('/api',require('./routes/'+r)))

// port
const port = process.env.PORT || 8000;

app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`)
})