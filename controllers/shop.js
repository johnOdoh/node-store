const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const stripe = require('stripe')('sk_test_51J1A3aAdrePqaQDqzdKtHoDSJnJJjjRD7w1PVUpDYUMAkJPSVH5xUNjEWj9g3nnAisRR0KwMov0CPm8Q02K0dHDk00BSG3orNA')

const Product = require('../models/product');
const Order = require('../models/order');
const Cart = require('../models/cart');
const Coupon = require('../models/coupon');
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
                const coupon = req.session.cart.coupon || {}
                res.render('cart', { path: 'shop', products: cartItems, tPrice: total, coupon: coupon, hasLimited: limited });
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

exports.postCoupon = async(req, res, next) => {
    const code = req.body.code
    try {
        const coupon = await Coupon.findOne({ name: code })
        if (!coupon) return res.redirect('back')
        req.session.cart.coupon = coupon
        res.redirect('back')
    } catch (err) {
        next(new Error(err))
    }

}

exports.removeCoupon = async(req, res, next) => {
    req.session.cart.coupon = undefined
    res.redirect('back')
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
    let discount = 0
    const prodIds = req.session.cart.products.map(p => p.prodId);
    Product.find({ _id: { $in: prodIds } }, (err, result) => {
        if (err) {
            return next(new Error(err));
        }
        Cart.getCart(req, result, (cartItems, limited) => {
            Cart.totalPrice(cartItems, total => {
                if (req.session.cart.coupon) {
                    discount = (total / 100) * req.session.cart.coupon.discount
                }
                res.render('checkout', { path: 'checkout', user: req.user, myCart: cartItems, tprice: total, error: req.flash('err')[0], hasLimited: limited, coupon: req.session.cart.coupon.discount || 0, dis: discount });
            })
        })
    })
}

exports.getStripe = async(req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const err = error.array()[0].msg
        return res.status(200).json({ error: err })
    }
    const prodIds = req.session.cart.products.map(p => p.prodId);
    try {
        const body = req.body
        if (!req.session.cart.coupon) req.session.cart.coupon = { discount: 0 }
        const result = await Product.find({ _id: { $in: prodIds } })
        Cart.getCart(req, result, async(cartItems) => {
            try {
                const items = cartItems.map(item => {
                    return {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: item.title,
                                images: [],
                            },
                            unit_amount: item.salePrice * 100,
                        },
                        quantity: item.qty
                    }
                })
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [...items, {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Delivery Fee',
                                images: [],
                            },
                            unit_amount: body.shipping * 100,
                        },
                        quantity: 1
                    }],
                    mode: 'payment',
                    // shipping_rates: [body.shippingId],
                    // shipping_address_collection: {
                    //     allowed_countries: []
                    // },
                    discounts: [{
                        coupon: req.session.cart.coupon.code || undefined
                    }],
                    success_url: req.protocol + '://' + req.get('host') + '/order',
                    cancel_url: req.protocol + '://' + req.get('host') + '/checkout'
                })
                const data = new Array(body.address1, body.address2, body.phone, body.country, body.city, body.zip, body.total, body.shipping)
                const cookieData = data.join('::')
                res.cookie('order', cookieData, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
                res.status(200).json({ id: session.id });
            } catch (err) {
                res.status(500).json()
            }
        })
    } catch (err) {
        res.status(500).json()
    }
}

exports.getOrder = async(req, res, next) => {
    const cookie = req.cookies['order'].split('::');
    const prodIds = req.session.cart.products.map(p => p.prodId);
    let shippingMethod;
    let total = +cookie[6] + +cookie[7]
    try {
        const result = await Product.find({ _id: { $in: prodIds } })
        if (cookie[7] > 15) {
            shippingMethod = 'Express';
        } else {
            shippingMethod = 'Standard';
        }
        Cart.getCart(req, result, async(cartItems) => {
            try {
                const code = Date.now().toString(36).concat(Math.random().toString(36).substring(2, 6));
                const orders = cartItems;
                const deliveryInfo = {
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    email: req.user.email,
                    address1: cookie[0],
                    address2: cookie[1],
                    phone: cookie[2],
                    country: cookie[3],
                    city: cookie[4],
                    zip: cookie[5]
                }
                let discount = 0
                if (req.session.cart.coupon.name) discount = (total / 100) * req.session.cart.coupon.discount
                total -= discount
                const order = new Order({
                    userId: req.user._id,
                    status: 'unlogged',
                    trackingCode: code,
                    total: total,
                    discount: discount,
                    shipping: {
                        method: shippingMethod,
                        fee: cookie[7]
                    },
                    products: orders,
                    deliveryAddress: deliveryInfo,
                    time: Date.now()
                })
                await order.save()
                Cart.clearCart(req, () => {
                    req.flash('success', 'Your Order has been Placed!');
                    if (req.body.save) {
                        req.user.deliveryAddress = deliveryInfo
                        req.user.save()
                    }
                })
                res.redirect('/admin/myOrders');
            } catch (error) {
                return next(new Error(err));
            }
        })
    } catch (err) {
        return next(new Error(err));
    }
}

exports.getHome = (req, res, next) => {
    res.render('home', { path: 'home' });
}

// exports.getService = (req, res, next) => {
//     res.render('service', { path: 'service' });
// }

exports.getShopdetail = (req, res, next) => {
    const prodid = req.params.productid;
    let wishlist = [];
    if (req.session.isLoggedIn) {
        wishlist = req.user.wishlist;
    }
    Product.findById(prodid)
        .then(result => {
            if (!result) {
                return res.redirect('/404');
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
                num: numOfProducts
            });
        })
        .catch(err => {
            return next(new Error(err));
        })
}

exports.getContactUs = (req, res, next) => {
    res.render('contact-us', { path: 'contact-us', errors: req.flash('err')[0], successMessage: req.flash('success') });
}

exports.postContactUs = (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        req.flash('err', error.mapped())
        return res.redirect('/contact-us')
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