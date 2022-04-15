import User from '../models/user'
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
// const updateDelayDays = async (accountId) =>{
//     const account = await stripe.accounts.update(accountId, {
//         settings:{
//             payouts:{
//                 schedule:{
//                     delay_days: 7
//                 }
//             }
//         }
//     })
//     return account
// }