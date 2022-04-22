import Post from '../models/post'
import fs from 'fs'

export const createPost = async (req,res) =>{
    console.log('req.fields: ',req.fields)
    console.log('req.files: ',req.files)

    try {
        let post = new Post(req.fields)
        post.postedBy = req.user._id
        //handle img if exist
        if(req.files.image){
            post.image.data = fs.readFileSync(req.files.image.path)
            post.image.contentType = req.files.image.type
        }
        post.save((err, result)=>{
            if(err){
                console.log('saving post error:------> ', err)
                res.status(400).send('Saving error!!!')
            }
            res.json(result)
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({
            err: err.message,
        })
    }
}

export const getAllPosts = async (req, res) =>{
    //only show 24 item, and without their imgs
    let all = await Post.find().limit(24).select('-image.data')
                        .populate('postedBy', '_id name')
                        .populate('comments', 'text createdAt')
                        .populate('comments.postedBy', '_id name')
                        .exec()
    res.json(all)
}

export const getPostImage = async (req, res) =>{
    let post = await Post.findById(req.params.postId).exec()
    if(post && post.image && post.image.data !== null){
        res.set('Content-type', post.image.contentType)
        return res.send(post.image.data)
    }
}

export const getPostsByUser = async (req,res) =>{
    let postsByUser = await Post.find({postedBy: req.user._id})
                                .select('-image.data')
                                .populate('postedBy', '_id name')
                                .populate('comments', 'text createdAt')
                                .populate('comments.postedBy', '_id name')
                                .exec()
    console.log('posts by userid', postsByUser)
    res.send(postsByUser)
}

export const deletePost = async (req, res) =>{
    let removed = await Post.findByIdAndDelete(req.params.postId).select('-image.data').exec()
    res.json(removed)

}

export const updateLike = async (req, res) =>{
    try{
        let updatedPost = await Post.findByIdAndUpdate(
            req.params.postId,
            {$push: {thumbs: req.user._id}},
            {new: true})
            .select('-image.data')
            .exec()
        res.json(updatedPost)
    } catch (err) {
        console.log(err)
        res.status(400).send('Thumbs up failed.')
    }

}

export const updateUnlike = async (req, res) =>{
    try{
        let updatedPost = await Post.findByIdAndUpdate(
            req.params.postId,
            {$pull: {thumbs: req.user._id}},
            {new: true})
            .select('-image.data')
            .exec()
        res.json(updatedPost)
    } catch (err) {
        console.log(err)
        res.status(400).send('Cancel thumbs up failed.')
    }
}

export const updateComment = async (req, res) =>{
    let comment  = {...req.body}
    comment.postedBy = req.user._id
    
    try{
        let updatedPost = await Post.findByIdAndUpdate(
            req.params.postId,
            {$push: {comments: comment}},
            {new: true})
            .select('-image.data')
            .populate('comments.postedBy', '_id name')
            .populate('postedBy', '_id name')
            .exec()
        res.json(updatedPost)
    } catch (err) {
        console.log(err)
        res.status(400).send('Cancel thumbs up failed.')
    }
}

export const updateUnComment = async (req, res) =>{
    let comment  = {...req.body}
    try{
        let updatedPost = await Post.findByIdAndUpdate(
            req.params.postId,
            {$pull: {comments: {_id: comment._id}}},
            {new: true})
            .select('-image.data')
            .populate('comments.postedBy', '_id name')
            .populate('postedBy', '_id name')
            .exec()
        res.json(updatedPost)
    } catch (err) {
        console.log(err)
        res.status(400).send('Cancel thumbs up failed.')
    }
}


// export const updateItem = async (req, res) =>{
//     try {
//         let fields = req.fields;
//         let files = req.files;
//         let data  = {...fields}

//         if(files.image){
//             let image = {}
//             image.data = fs.readFileSync(files.image.path)

//             image.contentType = files.image.type

//             data.image = image
//         }
//         console.log('updated req', req.fields)
//         let updated = await Item.findByIdAndUpdate(req.params.itemId, data, {
//             new: true
//         }).select('-image.data')
//         res.json(updated)
//     } catch (err) {
//         console.log(err)
//         res.status(400).send('Item updated failed.')
//     }

// }
export const getOnePost = async (req, res) =>{
    let post = await Post.findById(req.params.postId)
    .populate('postedBy', '_id name')
    .populate('comments', 'text createdAt')
    .populate('comments.postedBy', '_id name')
    .select('-image.data')
    .exec()
    
    console.log('One Post send to front end:', post )
    res.json(post)

}