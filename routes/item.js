import express from 'express'
import formidable from 'express-formidable'
import {create, items, image, sellerItems,removeItem, readItem, updateItem} from '../controllers/item'
import {requireSignin, itemOwner} from '../middlewares'

const router = express.Router()
router.post('/create-item',requireSignin,formidable(), create)
router.get('/items', items)
router.get('/item/image/:itemId', image)
router.get('/seller-items', requireSignin, sellerItems)
router.delete('/delete-item/:itemId',requireSignin,itemOwner, removeItem)
router.get('/item/:itemId', readItem)
router.put('/update-item/:itemId', requireSignin, itemOwner, formidable(), updateItem)
module.exports = router