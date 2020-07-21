const { validationResult } = require('express-validator');

const fs = require('fs');

const Product = require('../models/product');
const Order = require('../models/order');
const Functions = require('../util/functions');

exports.getDashboard = (req, res, next) => {
    let products;
    Product.find().sort('-sold')
        .then(result => {
            products = result;
            // products.sort((a, b) => b.quantity - a.quantity)
            return Order.find()
        })
        .then(result => {
            const outOfStock = products.filter(p => p.quantity === 0)
            const orderData = Functions.orderDetails(result);
            res.render('admin/dashboard', { orderData: orderData, outOfStock: outOfStock, products: products });
        })
        .catch(err => {
            return next(new Error(err));
        })
}

exports.getPlist = (req, res, next) => {
    const page = +req.query.page || 1;
    const productLimit = 5;
    let numOfProducts;
    Product.countDocuments()
        .then(count => {
            numOfProducts = count;
            return Product.find().sort('-_id')
                .skip((page - 1) * productLimit)
                .limit(productLimit)
        })
        .then(products => {
            const numOfPages = Math.ceil(numOfProducts / productLimit);
            res.render('admin/product-list', {
                products: products,
                successMessage: req.flash('success'),
                numOfPages: numOfPages,
                currentPage: page
            });
        })
        .catch(err => {
            return next(new Error(err));
        })
}

exports.getPdetail = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/product-detail', { product: product });
        })
        .catch(err => {
            return next(new Error(err));
        })
}

exports.getDelete = (req, res, next) => {
    const id = req.params.productId;
    Product.findByIdAndDelete(id)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            const pth = 'public' + product.image;
            fs.unlink(pth, (err) => {
                if (err) {
                    console.log(pth + 'NOT DELETED');
                }
            })
            req.flash('success', 'Product Deleted Successfully!');
            res.redirect('/admin/product-list');
        })
        .catch(err => {
            next(new Error(err));
        })
}

exports.getAdd = (req, res, next) => {
    res.render('admin/product-add', {
        imgError: req.flash('img'),
        successMessage: req.flash('success'),
        errors: {},
        input: {}
    });
}

exports.postAdd = (req, res, next) => {
    if (!req.file) {
        req.flash('img', 'Image must be a png, jpg or jpeg file')
        return res.status(422).render('admin/product-add', {
            imgError: req.flash('img'),
            successMessage: req.flash('success'),
            errors: {},
            input: {
                title: req.body.title,
                quantity: req.body.quantity,
                regPrice: req.body.reg_price,
                salePrice: req.body.sale_price,
                description: req.body.description
            }
        });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/product-add', {
            imgError: req.flash('img'),
            successMessage: req.flash('success'),
            errors: errors.mapped(),
            input: {
                title: req.body.title,
                quantity: req.body.quantity,
                regPrice: req.body.reg_price,
                salePrice: req.body.sale_price,
                description: req.body.description
            }
        });
    }
    const size = req.body.sizes || [];
    const sizes = size.map(s => {
        const obj = {};
        obj.size = s;
        obj.qty = +req.body[s];
        return obj
    })
    const image = '/shopImages/' + req.file.filename;
    const product = new Product({
        title: req.body.title,
        image: image,
        quantity: req.body.quantity,
        regPrice: req.body.reg_price,
        salePrice: req.body.sale_price,
        category: req.body.category,
        sex: req.body.sex,
        description: req.body.description,
        hasSize: req.body.has_size,
        sizes: sizes
    });
    product.save()
        .then(() => {
            req.flash('success', 'Product uploaded Successfully!');
            res.redirect('/admin/product-add');
        })
        .catch((err) => {
            return next(new Error(err));
        })
}

exports.getPedit = (req, res, next) => {
    const prodid = req.params.productid;
    Product.findById(prodid)
        .then(result => {
            if (!result) {
                return res.redirect('/');
            }
            const obj = {};
            result.sizes.forEach(p => {
                obj[p.size] = p.size;
                obj[p.size + 'Qty'] = p.qty;
            })
            res.render('admin/product-edit', { product: result, sizeData: obj, errors: req.flash('err')[0], imgSuccess: req.flash('imgSuc'), imgError: req.flash('imgErr') })
        })
        .catch((err) => {
            return next(new Error(err));
        })
}

exports.postImageEdit = (req, res, next) => {
    const id = req.body.id;
    let imgPath;
    if (!req.file) {
        req.flash('imgErr', 'Image Error! Image must be a jpg, jpeg or png file.');
        return res.redirect('back');
    }
    Product.findById(id)
        .then(product => {
            if (!product) {
                req.flash('imgErr', 'Sorry, something went wrong! Please try again.');
                return res.redirect('back');
            }
            imgPath = product.image;
            product.image = '/shopImages/' + req.file.filename;
            return product.save()
        })
        .then(() => {
            const pth = 'public' + imgPath;
            fs.unlink(pth, (err) => {
                if (err) {
                    console.log(pth + 'NOT DELETED');
                }
            })
            req.flash('imgSuc', 'Image Edited!');
            res.redirect('back');
        })
        .catch(err => {
            next(new Error(err));
        })
}

exports.postPedit = (req, res, next) => {
    const id = req.body.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('err', errors.mapped());
        return res.redirect('back');
    }
    const size = req.body.sizes || [];
    const sizes = size.map(s => {
        const obj = {};
        obj.size = s;
        obj.qty = +req.body[s];
        return obj
    })
    Product.findById(id)
        .then(product => {
            product.title = req.body.title;
            product.quantity = req.body.quantity;
            product.regPrice = req.body.reg_price;
            product.salePrice = req.body.sale_price;
            if (req.body.category) {
                product.category = req.body.category;
            }
            if (req.body.sex) {
                product.sex = req.body.sex;
            }
            product.description = req.body.description;
            if (req.body.has_size) {
                product.hasSize = req.body.has_size;
            }
            product.sizes = sizes
            return product.save()
        })
        .then((result) => {
            req.flash('success', 'Product Edited Successfully!');
            res.redirect('/admin/product-list');
        })
        .catch((err) => {
            return next(new Error(err));
        })
}


exports.getAddress = (req, res, next) => {
    res.render('admin/address', { user: req.user, errors: {}, successMessage: req.flash('success'), errMessage: req.flash('err') });
}

exports.postAddress = (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.render('admin/address', {
            user: req.user,
            errors: error.mapped(),
            successMessage: req.flash('success'),
            errMessage: req.flash('err')
        });
    }
    req.user.addressDetails.country = req.body.country;
    req.user.addressDetails.city = req.body.city;
    req.user.addressDetails.address1 = req.body.address1;
    req.user.addressDetails.address2 = req.body.address2;
    req.user.addressDetails.zip = req.body.zip;
    req.user.addressDetails.phoneNo = req.body.phone;
    req.user.save()
        .then(() => {
            req.flash('success', 'Delivery Address Edited Successfully!');
            res.redirect('/admin/address');
        })
        .catch(err => {
            return next(new Error(err));
        })
}

exports.getOrders = (req, res, next) => {
    const page = +req.query.page || 1;
    const productLimit = 5;
    let numOfProducts;
    Order.countDocuments()
        .then(count => {
            numOfProducts = count;
            return Order.find().sort('-_id')
                .skip((page - 1) * productLimit)
                .limit(productLimit)
        })
        .then(result => {
            const numOfPages = Math.ceil(numOfProducts / productLimit);
            res.render('admin/orders', {
                orders: result,
                numOfProducts: numOfProducts,
                currentPage: page,
                numOfPages: numOfPages
            })
        })
        .catch((err) => {
            return next(new Error(err));
        })
}

exports.getOrderDetails = (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
        .then(result => {
            res.render('admin/orderDetails', { order: result })
        })
        .catch((err) => {
            return next(new Error(err));
        })
}

exports.getMyOrders = (req, res, next) => {
    const page = +req.query.page || 1;
    const productLimit = 5;
    let numOfProducts;
    Order.countDocuments({ userId: req.user._id })
        .then(count => {
            numOfProducts = count;
            return Order.find({ userId: req.user._id }).sort('-_id')
                .skip((page - 1) * productLimit)
                .limit(productLimit)
        })
        .then(result => {
            const numOfPages = Math.ceil(numOfProducts / productLimit);
            res.render('admin/myOrders', {
                orders: result,
                successMessage: req.flash('success'),
                numOfProducts: numOfProducts,
                currentPage: page,
                numOfPages: numOfPages
            })
        })
        .catch((err) => {
            return next(new Error(err));
        })
}

exports.postOrderStatus = (req, res, next) => {
    const key = req.query.key;
    const id = req.body.id;
    Order.findById(id)
        .then(order => {
            if (key === 'log') {
                order.status = 'logged';
            } else if (key === 'complete') {
                order.status = 'delivered';
            } else {
                return res.redirect('/');
            }
            return order.save()
        })
        .then(() => {
            res.redirect('/admin/orders');
        })
        .catch(err => {
            next(new Error(err));
        })
}

exports.getMyWishlist = (req, res, next) => {
    req.user.populate('wishlist').execPopulate()
        .then(user => {
            res.render('admin/wishlist', { products: user.wishlist, successMessage: req.flash('success') });
        })
        .catch(err => {
            next(new Error(err));
        })
}

exports.getAlterWishlist = (req, res, next) => {
    const prodId = req.params.prodId;
    Product.countDocuments({ _id: prodId })
        .then(count => {
            if (count === 0) {
                return res.redirect('/');
            }
            const wishlist = req.user.wishlist;
            const index = wishlist.findIndex(p => p == prodId);
            if (index === -1) {
                wishlist.push(prodId);
            } else {
                wishlist.splice(index, 1);
            }
            req.user.save()
                .then(() => {
                    res.redirect('back');
                })
                .catch(err => {
                    next(new Error(err));
                })
        })
        .catch(err => {
            next(new Error(err));
        })
}

exports.getNewAdmin = (req, res, next) => {
    if (req.user.role !== 'super') {
        return res.redirect('/');
    }
    res.render('admin/new-admin', { successMessage: req.flash('success'), errMessage: req.flash('err') });
}