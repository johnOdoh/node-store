const { check } = require('express-validator');

exports.signUpVal = [
    check(['firstname', 'lastname']).trim().escape().not().isEmpty().withMessage('Please fill all fields!').isAlpha().withMessage('Must contain only alphabets!'),
    check('email').isEmail().withMessage('Please enter a valid Email address!').normalizeEmail(),
    check('password').isLength({ min: 5 }).withMessage('Password must be aleast 5 characters long!'),
    check('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords don\'t match!');
        }
        return true;
    })
]

exports.logInVal = [
    check('email').isEmail().withMessage('Please enter a valid Email address!').normalizeEmail(),
    check('password').isLength({ min: 5 }).withMessage('Invalid Password length!')
]

exports.addressVal = [
    check(['address1', 'phone', 'country', 'city', 'zip']).trim().escape().not().isEmpty().withMessage('Please fill all required fields'),
    check('address2').trim().escape(),
    check('phone').isNumeric().withMessage('Invalid Phone Number'),
    check('zip').isPostalCode(('any')).withMessage('Invalid Zip code')
]

exports.addProduct = [
    check(['quantity', 'reg_price', 'sale_price', 'category', 'has_size', 'sex']).trim().escape().not().isEmpty(),
    check(['quantity', 'reg_price', 'sale_price']).isNumeric(),
    check(['title', 'description']).trim().escape().isLength({ min: 5 })
]

exports.editProduct = [
    check(['quantity', 'reg_price', 'sale_price']).trim().escape().not().isEmpty().isNumeric(),
    check(['category', 'has_size', 'sex']).trim().escape(),
    check(['title', 'description']).trim().escape().isLength({ min: 5 })
]

exports.newAdminVal = [
    check('email').isEmail().normalizeEmail(),
    check('type').trim().escape().not().isEmpty()
]

exports.contactUsVal = [
    check('email').isEmail().normalizeEmail(),
    check(['name', 'subject', 'message']).trim().escape().not().isEmpty()
]