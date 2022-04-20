import User from '../models/user'
import jwt from 'jsonwebtoken'
export const register = async (req, res) => {
    console.log(req.body)

    try{
        const {name, email, password} = req.body
        //validations
        if(!name) return res.status(400).send('Name is required')
        if(!password) {
            return res.status(400).send('Password is required')
        }
        if(password.length < 4) {
            return res.status(400).send('Password should be at least 4 charactors long')
        }
        let userExist = await User.findOne({email}).exec()
        if(userExist){
            return res.status(400).send('Email is taken')
        }
        // validation passed
        const user = new User(req.body)
        
        await user.save()
        console.log('User created', user)
        return res.json({ok: true})
    }catch(err) {
        console.log('Create user failed', err)
        return res.status(400).send('Error. Try again')
    }
}

export const login= async(req,res) =>{
    console.log(req.body)
    const {email, password}  = req.body
    try {
        // check if user with that email exist
        let user = await User.findOne({email}).exec()
        console.log('User exist', user)

        if(!user){
            return res.status(400).send('User with that email not found')
        }
        //compare password
        user.comparePassword(password, (err, match)=>{
            console.log('compare password in login error', err)
            if(!match || err){
                return res.status(400).send('Wrong password')
            }
            console.log('Generate a token then send as response to client')
            // by using jwt.sign to create sign token
            let token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {
                expiresIn: '5d'
            })
            res.json({token,user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                stripe_account_id: user.stripe_account_id,
                stripe_seller: user.stripe_seller,
                stripeSession: user.stripeSession,
            }})
        })
    } catch (err) {
        console.log('Login error: ', err)
        res.status(400).send('Signin failed')
        
    }
}