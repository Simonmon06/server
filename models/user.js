const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
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
    stripe_account_id: '',
    stripe_seller: {},
    stripeSession: {},

},
    {timestamps: true} // everytime a  user is created/updated the createtiime and updatetime will be add as well.
)



userSchema.methods.comparePassword= function(password, next){
    bcrypt.compare(password, this.password, function(err, match){
        if(err){
            console.log("Compare password error", err)
            return next(err, false)
        }

        console.log('Match password', match)
        return next(null,match)
    })
}

userSchema.pre('save', function(next){
    let user = this
    if(user.isModified('password')){
        return bcrypt.hash(user.password, 12, function(err, hash){
            if(err){
                // console.log('error in bcrypt hash password', err)
                return next(err)
            }
            user.password = hash
            return next()
        })
    }else{
        return next()
    }
})

module.exports= mongoose.model('User', userSchema)