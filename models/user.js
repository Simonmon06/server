// const { v1: uuidv1 } = require('uuid')
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        required: 'Name is required'
    },
    email:{
        type: String,
        trim: true,
        required: 'email is required'
    },
    password:{
        type: String,
        required: true,
        min:6,
        max: 64
    },
    strip_account_id: '',
    stripe_seller: {},
    stripeSession: {},

},
    {timestamps: true}
)

userSchema.pre('save', function(next){
    let user = this
    if(user.isModified('password')){
        return bcrypt.hash(user.password, 12, function(err, hash){
            if(err){
                console.log('BCRYPT HASH ERROR', err)
                return next(err)
            }
            user.password = hash
            return next()
        })
    }else{
        return next()
    }
})

export default mongoose.model('User', userSchema)