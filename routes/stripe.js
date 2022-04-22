import express from 'express'
const router = express.Router()
import {createStripeIdAndLink, getAccountStatus, getAccountBalance, payoutSetting, stripeSessionId, stripeSuccess} from '../controllers/stripe'
import {requireSignin} from '../middlewares'

router.post('/create-stripe-account', requireSignin, createStripeIdAndLink)
router.post('/get-account-status', requireSignin, getAccountStatus)
router.post('/get-account-balance', requireSignin, getAccountBalance)
router.post('/payout-setting', requireSignin, payoutSetting)
router.post('/stripe-session-id', requireSignin, stripeSessionId)
router.post('/stripe-success', requireSignin, stripeSuccess)
module.exports = router