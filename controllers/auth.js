const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

const crypto = require('crypto');

const User = require('../models/user');
const Functions = require('../util/functions');
const user = require('../models/user');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'odohchinedu413@gmail.com',
        pass: 'barcelona321'
    }
});

exports.getLogIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.render('auth/login', { errMessage: req.flash('err'), successMessage: req.flash('success'), input: {} });
    }
    res.redirect('back');
}

exports.getSignUp = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.render('auth/signup', { errMessage: req.flash('err'), input: {}, errors: {} });
    }
    res.redirect('back');
}

exports.postSignUp = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('back');
    }
    const email = req.body.email;
    const firstName = req.body.firstname;
    const lastName = req.body.lastname;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            errMessage: req.flash('err'),
            successMessage: req.flash('success'),
            errors: errors.mapped(),
            input: {
                fName: firstName,
                lName: lastName,
                email: email
            }
        });
    }
    User.findOne({ email: email })
        .then(result => {
            if (result) {
                req.flash('err', 'Email Already in use, please try with a different Email');
                return res.status(422).render('auth/signup', {
                    errMessage: req.flash('err'),
                    successMessage: req.flash('success'),
                    errors: {},
                    input: {
                        fName: firstName,
                        lName: lastName,
                        email: email
                    }
                });
            }
            return bcrypt.hash(password, 10)
        })
        .then(hashedPassword => {
            const user = new User({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hashedPassword,
                addressDetails: {}
            })
            return user.save()
        })
        .then(() => {
            const mailOptions = {
                from: 'myshop@nodemailer.com',
                to: email, // list of receivers
                subject: 'Signup Successful', // Subject line
                html: '<p>Your Signup was successful, happy shopping</p>' // plain text body
            };
            transporter.sendMail(mailOptions, (err, info) => {
                if (err)
                    console.log(err)
            });
            req.flash('success', 'Registration successful, Login to continue shopping');
            res.redirect('/auth/login');
        })
        .catch((err) => {
            return next(new Error(err));
        })
}

exports.postLogIn = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('back');
    }
    const key = req.query.back;
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('err', errors.array()[0].msg);
        return res.status(422).render('auth/login', {
            errMessage: req.flash('err'),
            successMessage: req.flash('success'),
            input: {
                email: email
            }
        });
    }
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('err', 'Invalid Email or Password!');
                return res.redirect('/auth/login');
            }
            bcrypt.compare(password, user.password)
                .then(match => {
                    if (!match) {
                        req.flash('err', 'Invalid Email or Password!');
                        return res.redirect('/auth/login');
                    }
                    if (req.body.rem) {
                        const value = Functions.encrypt(email) + '::' + Functions.encrypt(password);
                        res.cookie('data', value, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true });
                    }
                    req.session.isLoggedIn = true;
                    req.session.userId = user._id;
                    req.session.role = user.role;
                    req.session.save(() => {
                        if (!key) {
                            return res.redirect('/shop');
                        }
                        res.redirect('back');
                    })
                })
                .catch(err => {
                    req.flash('err', 'Sorry something went wrong! Please try again');
                    res.redirect('/auth/login');
                })
        })
        .catch((err) => {
            return next(new Error(err));
        })
}

exports.getForgotPass = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.render('auth/forgotPassword', { errMessage: req.flash('err'), successMessage: req.flash('success') });
    }
    res.redirect('back');
}

exports.getResetPass = (req, res, next) => {
    const token = req.params.token;
    if (req.session.isLoggedIn) {
        return res.redirect('/home');
    }
    User.findOne({ resetToken: token, tokenExpire: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                req.flash('err', 'Invalid token! Please repeat the Password Reset process');
                return res.redirect('/auth/forgotPassword');
            }
            res.render('auth/passwordReset', { user: user._id, errMessage: req.flash('err'), successMessage: req.flash('success') });
        })
}

exports.postResetPass = (req, res, next) => {
    const email = req.body.email;
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            req.flash('err', 'Sorry something went wrong, please try again!');
            return res.redirect('/auth/forgotPassword');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: email })
            .then(user => {
                if (!user) {
                    req.flash('err', 'No user with that Email address found!');
                    return res.redirect('/auth/forgotPassword');
                }
                user.resetToken = token;
                user.tokenExpire = Date.now() + 3600000;
                return user.save()
            })
            .then(() => {
                req.flash('success', 'A Password Reset link has been sent to your Email');
                res.redirect('/auth/forgotPassword');

                const mailOptions = {
                    from: 'myshop@nodemailer.com',
                    to: email,
                    subject: 'Password Reset for your Node App',
                    html: `
                        <h5>Password reset link</h5>
                        <p>Click on the link below to reset your password</p>
                        <div>
                            <a href="http://localhost:3000/auth/passwordReset/${token}">reset link</a>
                        </div>
                    `
                };
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.log(err);
                    }
                })
            })
            .catch(err => {
                next(new Error(err));
            })
    })
}

exports.postChangePass = (req, res, next) => {
    const password = req.body.password;
    const userId = req.body.userId;
    User.findById(userId)
        .then(user => {
            if (!user) {
                req.flash('err', 'Sorry something went wrong! Please try again!')
                return res.redirect('back');
            }
            bcrypt.hash(password, 10)
                .then(hash => {
                    user.password = hash;
                    user.resetToken = undefined;
                    user.tokenExpire = undefined;
                    return user.save()
                })
                .then(() => {
                    req.flash('success', 'Password Reset Successful!');
                    res.redirect('/auth/login');
                })
                .catch(err => {
                    console.log(err);
                })
        })
        .catch(err => {
            return next(new Error(err));
        })
}

exports.postNewAdmin = (req, res, next) => {
    if (req.user.role !== 'super') {
        return res.redirect('/404');
    }
    const error = validationResult(req);
    if (!error.isEmpty()) {
        req.flash('err', 'Invalid Email Address!')
        return res.redirect('/admin/newAdmin');
    }
    const email = req.body.email;
    const type = req.body.type;
    let name
    user.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('err', 'No user with that Email address found!');
                return res.redirect('back');
            }
            if (user.role == type) {
                req.flash('err', 'User already upgraded!');
                return res.redirect('back');
            }
            user.role = type;
            name = user.firstName + ' ' + user.lastName;
            return user.save()
        })
        .then(() => {
            req.flash('success', 'Admin Successfully Created!');
            res.redirect('back');
            const mailOptions = {
                from: 'myshop@nodemailer.com',
                to: email,
                subject: 'Status Upgrade',
                html: `
                    <p>Dear ${name}, your status in Johnny Shop has been Upgraded. You are now an Admin.</p>
                    <p>Welcome to our Team. Let us work hard to make Johnny shop a success.</p>
                    <p>Login to your account to explore the new features of your account. Cheers</p>
                `
            };
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(err);
                }
            })
        })
        .catch(err => {
            return next(new Error(err));
        })
}

exports.postRemoveAdmin = (req, res, next) => {
    if (req.user.role !== 'super') {
        return res.redirect('/404');
    }
    const error = validationResult(req);
    if (!error.isEmpty()) {
        req.flash('err', 'Invalid Email Address!')
        return res.redirect('/admin/newAdmin');
    }
    let name
    const email = req.body.email;
    user.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('err', 'No user with that Email address found!');
                return res.redirect('back');
            }
            if (user.role == 'user') {
                req.flash('err', 'User not an Admin!');
                return res.redirect('back');
            }
            user.role = 'user';
            name = user.firstName + ' ' + user.lastName;
            return user.save()
        })
        .then(() => {
            req.flash('success', 'Admin Successfully Removed!');
            res.redirect('back');
            const mailOptions = {
                from: 'myshop@nodemailer.com',
                to: email,
                subject: 'Suspension of Admin Previledges',
                html: `
                    <p>Dear ${name}, your status as an Admin in Johnny Shop has been suspended indefinitely.</p>
                    <p>You can still use your account for shopping. Thanks.</p>
                `
            };
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(err);
                }
            })
        })
        .catch(err => {
            return next(new Error(err));
        })
}

exports.postLogOut = (req, res, next) => {
    req.session.isLoggedIn = false;
    req.session.userId = null;
    req.session.save(() => {
        res.redirect('/');
    })
}