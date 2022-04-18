import User from '../models/user'
import Item from '../models/item'
import Order from '../models/order'
const stripe = require('stripe')(process.env.STRIPE_SECRET)
import queryString from 'query-string'
export const createConnectAccount = async (req ,res) =>{
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

export const getAccountStatus = async(req, res) =>{
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


export const getAccountBalance = async(req, res) =>{
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


// get one time login link for he can access his user setting
export const payoutSetting = async(req, res) =>{
    const user = await User.findById(req.user._id).exec()

    try {
        const loginLink = await stripe.accounts.createLoginLink(
            user.stripe_account_id,
            {
                redirect_url: process.env.STRIPE_SETTING_REDIRECT_URL
            }
        )


        console.log('url is :', process.env.STRIPE_SETTING_REDIRECT_URL)

        // console.log('Login Link for payout setting', loginLink)
        res.json(loginLink)
    } catch (err) {
        console.log('stripe payout setting error', err)
    }

}


export const stripeSessionId = async(req, res) =>{
    // 1. get item id from req.body
    const {itemId} = req.body
    // 2. find the item based on item id from db
    const item = await Item.findById(itemId).populate('postedBy').exec()
    // 3. 10% charge as application fee
    const fee = (item.price *10)/100
    // 4. create a session
    console.log('you hit stripe session id', req.body.itemId)
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        // 5. item detail
        line_items: [{
            name: item.title,
            amount: item.price * 100, // in cents
            currency: 'cad',
            quantity: 1
        }],
        // 6. create the payment_intent_data with application_fee_amount and destination charge 10%
        payment_intent_data: {
        application_fee_amount: fee * 100,
        transfer_data: {
            destination: item.postedBy.stripe_account_id,
            },
        },
        //redirect url 
        success_url: `${process.env.STRIPE_SUCCESS_URL}/${item._id}`,
        cancel_url: process.env.STRIPE_CANCEL_URL

    })
    // console.log('SESSION ===>', session)
    // 7. add the session (order) to user who do the purchase in the db 
    let updatedUser  = await User.findByIdAndUpdate(req.user._id, {stripeSession: session},{new: true}).exec()
    // console.log('updatedUser: ======> ', updatedUser)
    //
    // 8. send the response which contains session id to front end
    res.send({
        sessionId: session.id
    })
}

export const stripeSuccess = async(req, res) =>{
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
                res.json({success:true})
                // 7 update the item info unpaid to paid
                await Item.findByIdAndUpdate(item._id, {
                    $set:{paid:true}
                })
            }
        }
    } catch (error) {
        console.log('stripeSuccess error: ', error)
    }
}
// const updateDelayDays = async (accountId) =>{
//     const account = await stripe.accounts.update(accountId, {
//         settings:{
//             payouts:{
//                 schedule:{
//                     delay_days: 1
//                 }
//             }
//         }
//     })
//     return account
// }