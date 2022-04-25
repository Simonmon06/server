
const User = require('../models/user')


const searchUsers = async (req, res) =>{

    const {name}  = req.body
    let result = await User.find( {name: new RegExp(name,"i")}).exec()
    res.json(result)
    
}


module.exports = {
    searchUsers
}