import express from 'express'
import {searchUsers} from '../controllers/user.js'
import {requireSignin} from '../middlewares'

const router = express.Router()
router.post('/search-users',requireSignin, searchUsers)


module.exports = router