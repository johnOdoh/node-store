const express = require('express');

const fs = require('fs');

const path = require('path');

const shopController = require('../controllers/shop');
const midWare = require('../util/middleware');
const validator = require('../util/validation');

const router = express.Router();

router.get('/', midWare.cartLength, midWare.checkDataCookie, shopController.getHome);

router.get('/home', midWare.cartLength, midWare.checkDataCookie, shopController.getHome);

router.get('/shop', midWare.cartLength, midWare.checkDataCookie, shopController.getShop);

router.get('/shop-detail/:productid', midWare.cartLength, midWare.checkDataCookie, shopController.getShopdetail);

router.get('/about', midWare.cartLength, midWare.checkDataCookie, shopController.getAboutus);

router.get('/contact-us', midWare.cartLength, midWare.checkDataCookie, shopController.getContactUs);

// router.get('/service', midWare.cartLength, midWare.checkDataCookie, shopController.getService);

router.post('/contact-us', validator.contactUsVal, shopController.postContactUs);

router.post('/cart', shopController.postCart);

router.get('/remCart', midWare.cartLength, shopController.deleteCart);

router.get('/cart', midWare.cartLength, midWare.checkDataCookie, shopController.getCart);

router.get('/checkout', midWare.auth, midWare.cartLength, midWare.checkDataCookie, shopController.getCheckout);

router.post('/stripe', midWare.auth, validator.addressVal, shopController.getStripe);

router.post('/coupon', shopController.postCoupon)

router.get('/removeCoupon', shopController.removeCoupon)

router.get('/order', shopController.getOrder);

module.exports = router;