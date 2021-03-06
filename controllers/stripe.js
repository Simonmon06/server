
const User = require('../models/user')
const Item = require('../models/item')
const Order = require('../models/order')
const stripe = require('stripe')(process.env.STRIPE_SECRET)
const queryString = require('query-string')
const createStripeIdAndLink = async (req ,res) =>{
    // 1. find user from db
    const user = await User.findById(req.user._id).exec()
    console.log('User ==>', user)
    // 2. if user don't haev stripe_account_id yet, create now
    if(!user.stripe_account_id){
        const account = await stripe.accounts.create({type: 'express'})
        console.log('Account: ', account)
        user.stripe_account_id = account.id
        user.save()
    }

    // 3. create account link based on account id (for front end to complete onboarding)
    // account id is minimum requirment
    // and app prefill basic info for users 
    // @return_url: after finish the loading process app redirect user to ..

    let accountLink = await stripe.accountLinks.create({
        account: user.stripe_account_id,
        refresh_url: process.env.STRIPE_REDIRECT_URL,
        return_url: process.env.STRIPE_REDIRECT_URL,
        type: 'account_onboarding'
    })

    //prefill more
    accountLink = Object.assign(accountLink,{
        'stripe_user[email]': user.email || undefined,
    })
    // console.log('Account Link', accountLink)
    // send to front end
    let link = `${accountLink.url}?${queryString.stringify(accountLink)}`
    console.log('Login link', link)
    res.send(link)
    // 4. update payment schedule (optional, default is 2 days)


}

const getAccountStatus = async(req, res) =>{
    console.log('Get Account status')
    // 1. find user from db
    const user = await User.findById(req.user._id).exec()
    //here account give you charges_enabled = true 
    const account  = await stripe.accounts.retrieve(user.stripe_account_id)
    // console.log('User account retrieve', account)

    //update something in the stripe account
    // const updatedAccount = await updateDelayDays(account.id)


    // save it locally
    const updatedUser = await User.findByIdAndUpdate(user._id, {
        stripe_seller: account,
        // stripe_seller: updatedAccount,
    }, {new: true}) // new: true make sure you get the  updatedUser value back 
    .select('-password').exec(); // and select everything but not password

    console.log('updatedUser', updatedUser)
    res.json(updatedUser) //save this in the response
    
}


const getAccountBalance = async(req, res) =>{
    const user = await User.findById(req.user._id).exec()

    try {
        const balance = await stripe.balance.retrieve({
            stripeAccount: user.stripe_account_id
        })
        console.log('User Balance ------->', balance)
        res.json(balance);
    } catch (err) {
        console.log(err)
    }

}



const stripeSessionId = async(req, res) =>{
    // 1. get item id from req.body
    const {itemId} = req.body
    // 2. find the item based on item id from db
    const item = await Item.findById(itemId).populate('postedBy').exec()
    // 3. create a session
    console.log('you hit stripe session id', req.body.itemId)
    const session = await stripe.checkout.sessions.create({
        // 4. item detail
        line_items: [{
            name: item.title,
            amount: item.price * 100, // in cents
            currency: 'cad',
            quantity: 1
        }],
        
        // 5. seller's id
        payment_intent_data: {
        transfer_data: {
            destination: item.postedBy.stripe_account_id,
            },
        },
        payment_method_types: ['card'],
        //redirect url 
        success_url: `${process.env.PAYMENT_SUCCESS}/${item._id}`,
        cancel_url: process.env.PAYMENT_CANCEL

    })
    // console.log('SESSION ===>', session)
    // 6. add the session (order) to user who do the purchase in the db 
    let updatedUser  = await User.findByIdAndUpdate(req.user._id, {stripeSession: session},{new: true}).exec()
    // console.log('updatedUser: ======> ', updatedUser)
    //
    // 7. send the response which contains session id to front end
    res.send({
        sessionId: session.id
    })
}

const stripeSuccess = async(req, res) =>{
    try {
        // 1. get itemId from req.body
        const {itemId} = req.body
        // 2. find current user
        const user = await User.findById(req.user._id).exec()
        // retrieve stipe session, based on the session id which has been saved in the user db
        if(!user.stripeSession){
            return;
        }
        const session = await stripe.checkout.sessions.retrieve(user.stripeSession.id)
        // 4 if session payment status is paid, create order
        if(session.payment_status === 'paid'){
            const orderExists = await Order.findOne({'session.id': session.id}).exec()
            if (orderExists){
                //6 if orderExists send success:true, sometimes users try to go back to last page after success...
                res.json({success:true})
            } else{
                let order = await new Order({
                    item: itemId,
                    orderedBy: user._id,
                    session,
                }).save()
                // remove user's stripeSession
                await User.findByIdAndUpdate(user._id, {
                    $set:{stripeSession:{}}
                })
                await Item.findByIdAndUpdate(itemId, {
                    $set:{paid:true}
                })
                res.json({success:true})
                // 7 update the item info unpaid to paid

            }
        }
    } catch (error) {
        console.log('stripeSuccess error: ', error)
    }
}

module.exports = {
    createStripeIdAndLink,
    getAccountStatus,
    getAccountBalance,
    stripeSessionId,
    stripeSuccess
}