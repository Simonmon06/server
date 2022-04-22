import express from 'express'
import formidable from 'express-formidable'
import {createPost, getAllPosts, getPostImage, getPostsByUser, deletePost, updateLike, updateUnlike,getOnePost, updateComment,updateUnComment } from '../controllers/post.js'
import {postOwner, requireSignin} from '../middlewares'

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