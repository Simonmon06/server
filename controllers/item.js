
const Item = require('../models/item')
const Order = require('../models/order')
const fs = require('fs')

const create = async (req,res) =>{
    console.log('req.fields: ',req.fields)
    console.log('req.files: ',req.files)

    try {
        let item = new Item(req.fields)
        item.postedBy = req.user._id
        //handle img if exist
        if(req.files.image){
            item.image.data = fs.readFileSync(req.files.image.path)
            item.image.contentType = req.files.image.type
        }
        item.save((err, result)=>{
            if(err){
                console.log('saving item error:------> ', err)
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
// show all item for all users
const items = async (req, res) =>{
    //only show 24 item, and without their imgs
    let all = await Item.find({paid: false}).select('-image.data').populate('postedBy', '_id name').exec()
    res.json(all)
}
// show img for the items
const image = async (req, res) =>{
    let item = await Item.findById(req.params.itemId).exec()
    if(item && item.image && item.image.data !== null){
        res.set('Content-type', item.image.contentType)
        return res.send(item.image.data)
    }
}


// show item for current user
const sellerItems = async (req,res) =>{
    let all = await Item.find({postedBy: req.user._id}).select('-image.data').populate('postedBy', '_id name').exec()
    console.log('items by userid', all)
    res.send(all)
}

const readItem = async (req, res) =>{
    let item = await Item.findById(req.params.itemId)
    .populate('postedBy', '_id name')
    .select('-image.data')
    .exec()
    
    console.log('One Item send to front end:', item )
    res.json(item)

}

const updateItem = async (req, res) =>{
    try {
        let fields = req.fields;
        let files = req.files;
        let data  = {...fields}

        if(files.image){
            let image = {}
            image.data = fs.readFileSync(files.image.path)

            image.contentType = files.image.type

            data.image = image
        }
        console.log('updated req', req.fields)
        let updated = await Item.findByIdAndUpdate(req.params.itemId, data, {
            new: true
        }).select('-image.data')
        res.json(updated)
    } catch (err) {
        console.log(err)
        res.status(400).send('Item updated failed.')
    }

}

const removeItem = async (req, res) =>{
    let removed = await Item.findByIdAndDelete(req.params.itemId).select('-image.data').exec()
    res.json(removed)

}



const userOrders = async (req, res) =>{
    const allOrdersForOneUser = await Order.find({orderedBy: req.user._id})
    .select('session')
    .populate('item', '-image.data')
    .populate('orderedBy','_id name')
    .exec()

    res.json(allOrdersForOneUser)
}

const searchItems = async (req, res) =>{
    const {title, condition}  = req.body
    let result = await Item.find({title,condition}).select('-image.data').exec()
    res.json(result)
}

module.exports = {
    create,
    items,
    image,
    sellerItems,
    removeItem,
    readItem,
    updateItem,
    userOrders,
    searchItems
}