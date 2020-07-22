const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

const Product = require('../models/product');
const Order = require('../models/order');
const Cart = require('../models/cart');
const Functions = require('../util/functions');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'odohchinedu413@gmail.com',
        pass: 'barcelona321'
    }
});

exports.getAboutus = (req, res, next) => {
    res.render('about', { path: 'about' });
}

exports.getCart = (req, res, next) => {
    const prodIds = req.session.cart.products.map(p => p.prodId);
    Product.find({ _id: { $in: prodIds } }, (err, result) => {
        if (err) {
            return next(new Error(err));
        }
        Cart.getCart(req, result, (cartItems, limited) => {
            Cart.totalPrice(cartItems, total => {
                res.render('cart', { path: 'shop', products: cartItems, tPrice: total, hasLimited: limited });
            })
        })
    })
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.id;
    const size = req.body.size;
    const qty = req.body.qty;
    const cart = new Cart();
    cart.addToCart(req, prodId, qty, size, (cartLength) => {
        res.status(200).json({ length: cartLength })
    })
}

exports.deleteCart = (req, res, next) => {
    const prodId = req.query.prodId;
    const size = req.query.size;
    if (!prodId || !size) {
        return res.status(400).json({ message: 'Failed' });
    }
    Cart.deleteFromCart(req, prodId, size, (cartLength) => {
        res.status(200).json({ message: 'Deleted', length: cartLength });
    })
}

exports.getCheckout = (req, res, next) => {
    if (req.session.cart.products.length === 0) {
        return res.redirect('/cart');
    }
    const prodIds = req.session.cart.products.map(p => p.prodId);
    Product.find({ _id: { $in: prodIds } }, (err, result) => {
        if (err) {
            return next(new Error(err));
        }
        Cart.getCart(req, result, (cartItems, limited) => {
            Cart.totalPrice(cartItems, total => {
                res.render('checkout', { path: 'checkout', user: req.user, myCart: cartItems, tprice: total, error: req.flash('err')[0], hasLimited: limited });
            })
        })
    })
}

exports.postCheckout = (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        req.flash('err', error.mapped())
        return res.redirect('/checkout');
    }
    const prodIds = req.session.cart.products.map(p => p.prodId);
    let shippingMethod;
    const total = +req.body.total + +req.body.shippingOption;
    Product.find({ _id: { $in: prodIds } }, (err, result) => {
        if (err) {
            return next(new Error(err));
        }
        if (req.body.shippingOption > 15) {
            shippingMethod = 'Express';
        } else {
            shippingMethod = 'Standard';
        }
        Cart.getCart(req, result, (cartItems) => {
            const code = Date.now().toString(36).concat(Math.random().toString(36).substring(2, 6));
            const orders = cartItems;
            const order = new Order({
                userId: req.user._id,
                status: 'unlogged',
                trackingCode: code,
                total: total,
                shipping: {
                    method: shippingMethod,
                    fee: req.body.shippingOption
                },
                products: orders,
                deliveryAddress: {
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    email: req.user.email,
                    address1: req.body.address1,
                    address2: req.body.address2,
                    phone: req.body.phone,
                    country: req.body.country,
                    city: req.body.city,
                    zip: req.body.zip
                },
                time: Date.now()
            })
            order.save()
                .then(() => {
                    Cart.clearCart(req, () => {
                        req.flash('success', 'Your Order has been Placed!');
                        res.redirect('/admin/myOrders');
                        if (req.body.save) {
                            req.user.deliveryAddress = {
                                firstName: req.user.firstName,
                                lastName: req.user.lastName,
                                email: req.user.email,
                                address1: req.body.address1,
                                address2: req.body.address2,
                                phone: req.body.phone,
                                country: req.body.country,
                                city: req.body.city,
                                zip: req.body.zip
                            };
                            req.user.save();
                        }
                    })
                })
                .catch((err) => {
                    return next(new Error(err));
                })
        })
    })
}

exports.getHome = (req, res, next) => {
    res.render('home', { path: 'home' });
}

exports.getService = (req, res, next) => {
    res.render('service', { path: 'service' });
}

exports.getShopdetail = (req, res, next) => {
    const prodid = req.params.productid;
    let wishlist = [];
    if (req.session.isLoggedIn) {
        wishlist = req.user.wishlist;
    }
    Product.findById(prodid)
        .then(result => {
            if (!result) {
                return res.redirect('/');
            }
            res.render('shop-detail', { path: 'product', productDetail: result, wishlist: wishlist });
        })
        .catch(err => {
            next(new Error(err));
        })
}

exports.getShop = (req, res, next) => {
    const cat = req.query.cat;
    const sex = req.query.for;
    const search = req.query.q;
    const min = +req.query.min;
    const max = +req.query.max;
    const page = +req.query.page || 1;
    const productLimit = 10;
    let category,
        filter,
        numOfProducts,
        wishlist = [];
    if (req.session.isLoggedIn) {
        wishlist = req.user.wishlist;
    }
    if (min > -1 && max > 0) {
        if (search) {
            filter = {
                $or: [{ description: new RegExp(search, 'i') }, { title: new RegExp(search, 'i') }],
                salePrice: { $gt: min, $lt: max }
            };
        } else {
            if (sex && cat) {
                filter = { category: cat, sex: sex, salePrice: { $gt: min, $lt: max } };
            } else {
                filter = { salePrice: { $gt: min, $lt: max } };
            }
        }
    } else {
        if (search) {
            filter = {
                $or: [{ description: new RegExp(search, 'i') }, { title: new RegExp(search, 'i') }]
            };
        } else {
            if (sex && cat) {
                filter = { category: cat, sex: sex };
            } else {
                filter = {};
            }
        }
    }
    Product.find()
        .then(products => {
            category = Functions.mapper(products);
            return Product.countDocuments(filter)
        })
        .then(count => {
            numOfProducts = count;
            return Product.find(filter).sort('-_id')
                .skip((page - 1) * productLimit)
                .limit(productLimit)
        })
        .then(result => {
            const numOfPages = Math.ceil(numOfProducts / productLimit);
            res.render('shop', {
                path: 'product',
                products: result,
                category: category,
                numOfPages: numOfPages,
                currentPage: page,
                currentCat: cat,
                currentSex: sex,
                search: search,
                wishlist: wishlist,
                num: numOfPagees
            });
        })
        .catch(err => {
            return next(new Error(err));
        })
}

exports.getContactUs = (req, res, next) => {
    res.render('contact-us', { path: 'contact-us', errors: {}, errMessage: req.flash('err'), successMessage: req.flash('success') });
}

exports.postContactUs = (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.render('contact-us', {
            path: 'contact-us',
            errors: error.mapped(),
            successMessage: req.flash('success'),
            errMessage: req.flash('err')
        });
    }
    const name = req.body.name;
    const email = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;

    const mailOptions = {
        from: email,
        to: 'chineduodoh4@gmail.com',
        subject: subject + 'from' + name,
        html: message
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
            req.flash('err', 'Message not sent, please try again!');
            return res.redirect('back');
        }
        req.flash('success', 'Message sent!');
        res.redirect('back');
    })
}
