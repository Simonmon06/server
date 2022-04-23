const expressJwt = require('express-jwt')
const Item = require('../models/item')
const Post = require('../models/Post')

// chekc token and expire date
const requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
})


// check the deleted item is belong to the current user
const itemOwner = async (req,res,next) =>{
    let item = await Item.findById(req.params.itemId).exec()
    // have to use == here... === need to convert them to string...
    let owner = item.postedBy._id.toString() === req.user._id.toString()
    console.log('owner:', owner)
    if(!owner){
        return res.status(403).send('Unauthorized in middleware')
    }

    next();
}


const postOwner = async (req,res,next) =>{
    let post = await Post.findById(req.params.postId).exec()
    let owner = post.postedBy._id.toString() === req.user._id.toString()
    console.log('owner:', owner)
    if(!owner){
        return res.status(403).send('Unauthorized in middleware')
    }

    next();
}
module.exports = {
    requireSignin,
    itemOwner,
    postOwner
}