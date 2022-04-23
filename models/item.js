const mongoose = require('mongoose')
const {Schema} = mongoose
const {ObjectId} = mongoose.Schema
const itemSchema = new Schema ({
    title:{
        type: String,
        required: 'Title is required'
    },
    content:{
        type: String,
        required: 'Content is required',
        maxLength: 10000
    },
    size: {
        type: String,
    },
    location:{
        type:String,
    },
    condition:{
        type: String
    },
    price:{
        type: Number,
        required: 'Price is required',
        trim: true
    },
    postedBy:{
        type: ObjectId,
        ref: 'User'
    },
    image:{
        data: Buffer,
        contentType: String
    },
    purchaseDate:{
        type: Date,
    },
    paid: {
        type: Boolean,
        default: false,
    }
}, {timestamps: true})

module.exports= mongoose.model('Item', itemSchema)