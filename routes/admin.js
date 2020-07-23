const express = require('express');

const adminController = require('../controllers/admin');
const midWare = require('../util/middleware');
const validator = require('../util/validation');

const router = express.Router();

router.get('/product-add', midWare.isAdmin, adminController.getAdd);

router.post('/product-add', midWare.isAdmin, validator.addProduct, adminController.postAdd);

router.get('/product-detail/:productId', midWare.isAdmin, adminController.getPdetail);

router.get('/deleteProduct/:productId', midWare.isAdmin, adminController.getDelete);

router.get('/product-edit/:productid', midWare.isAdmin, adminController.getPedit);

router.post('/product-edit', midWare.isAdmin, validator.editProduct, adminController.postPedit);

router.post('/editImage', midWare.isAdmin, adminController.postImageEdit);

router.get('/product-list', midWare.isAdmin, adminController.getPlist);

router.get('/adminDashboard', midWare.isAdmin, adminController.getAdminDashboard);

router.get('/orders', midWare.isAdmin, adminController.getOrders);

router.get('/dashboard', midWare.auth, adminController.getDashboard);

router.get('/myOrders', midWare.auth, adminController.getMyOrders);

router.get('/orderDetails/:orderId', midWare.auth, adminController.getOrderDetails);

router.post('/orderStatus', midWare.auth, adminController.postOrderStatus);

router.get('/address', midWare.auth, adminController.getAddress);

router.post('/address', midWare.auth, validator.addressVal, adminController.postAddress);

router.get('/wishlist/:prodId', midWare.auth, adminController.getAlterWishlist);

router.get('/myWishlist', midWare.auth, adminController.getMyWishlist);

router.get('/newAdmin', midWare.auth, adminController.getNewAdmin);

module.exports = router;
