const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    image:{
        data: Buffer,
        contentType: String
    },
    postedBy: {
        type:ObjectId,
        ref: "User"
    },
    thumbs:[
        {type: ObjectId, ref: "User"}
    ],
    comments:[
        {
            text: String,
            createdAt:{type: Date, default: Date.now},
            postedBy: {type: ObjectId, ref: "User"}
        }
    ]
    
},{ timestamps: true })

module.exports = mongoose.model('Post', postSchema)