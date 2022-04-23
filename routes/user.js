const express = require('express')
const {searchUsers} = require('../controllers/user')
const {requireSignin} = require('../middlewares')

const router = express.Router()
router.post('/search-users',requireSignin, searchUsers)


module.exports = router