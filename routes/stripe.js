const express = require('express')
const router = express.Router()
const {createStripeIdAndLink, getAccountStatus, getAccountBalance, stripeSessionId, stripeSuccess} = require('../controllers/stripe')
const {requireSignin} = require('../middlewares')

router.post('/create-stripe-account', requireSignin, createStripeIdAndLink)
router.post('/get-account-status', requireSignin, getAccountStatus)
router.post('/get-account-balance', requireSignin, getAccountBalance)
router.post('/stripe-session-id', requireSignin, stripeSessionId)
router.post('/stripe-success', requireSignin, stripeSuccess)
module.exports = router