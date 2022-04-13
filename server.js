import express from 'express'
// filesystem
import {readdirSync} from 'fs'
import cors from 'cors'
import mongoose from 'mongoose'
const morgan = require('morgan')
require('dotenv').config()

mongoose
  .connect(process.env.MONGODB_ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB Error => ", err));


const app = express()
const port = process.env.PORT || 8001



// middleware
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

// route middleware
// prefixed url, add /api everytime
readdirSync('./routes').map((r) => app.use('/api', require(`./routes/${r}`)))
app.listen(port, ()=> console.log(`server is running on port ${port}`))