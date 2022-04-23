const express = require('express')
const formidable = require('express-formidable')
const {createPost, getAllPosts, getPostImage, getPostsByUser, deletePost, updateLike, updateUnlike,getOnePost, updateComment,updateUnComment } = require('../controllers/post.js')
const {requireSignin, postOwner} = require('../middlewares')
const router = express.Router()
router.post('/create-post',requireSignin, formidable(), createPost)
router.get('/posts', getAllPosts)
router.put('/post/like/:postId', requireSignin, updateLike)
router.put('/post/unlike/:postId', requireSignin, updateUnlike)
router.get('/post/image/:postId', getPostImage)
router.get('/user-posts', requireSignin, getPostsByUser)
router.delete('/delete-post/:postId',requireSignin,postOwner, deletePost)

router.get('/post/:postId', getOnePost)
router.put('/post/comment/:postId', requireSignin, updateComment)
router.put('/post/uncomment/:postId', requireSignin, updateUnComment)

module.exports = router