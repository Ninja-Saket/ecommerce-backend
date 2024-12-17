import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import cors from 'cors'
import {readdirSync} from 'fs'
import {config} from 'dotenv'
config()

// app
const app = express()

// db
mongoose.connect(process.env.DATABASE_URL).then(()=> console.log('Db connected!!'))
.catch((err)=> console.log('Db connection error', err))


// middlewares
app.use(morgan('dev'))
app.use(bodyParser.json({limit : '50mb'}))
app.use(cors())

// routes middleware
readdirSync('./routes').forEach(async (file) => {
    const route = await import('./routes/' + file);
    app.use('/api', route.default);
});

// port
const port = process.env.PORT || 8000;

app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`)
})