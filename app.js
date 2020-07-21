//external dependency package import
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const mongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

//local express package import
const path = require('path');

//custom script import
const User = require('./models/user');

//Route imports
const shopRoutes = require('./routes/shop');
const wishlistRoutes = require('./routes/wishlist');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

//Express initialization
const app = express();
const sessionStore = new mongoDBStore({
    uri: 'mongodb+srv://johnny:12345678%2B%2B--@johnny-u8qnc.mongodb.net',
    databaseName: 'shop',
    collection: 'sessions'
});

//setting up the view engine
app.set('view engine', 'ejs');
//app.set('views', 'views');

//utility middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/admin', multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'public/shopImages');
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'test secret',
    name: 'sessionId',
    saveUninitialized: false,
    resave: false,
    store: sessionStore,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true }
}));
app.use(csrf());
app.use(flash());
app.use(cookieParser());
app.use(helmet());

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use((req, res, next) => {
    if (req.session.userId) {
        User.findById(req.session.userId)
            .then(user => {
                req.user = user;
                next();
            })
            .catch((err) => {
                console.log(err);
            })
    } else {
        next();
    }
});

//route middlewares 
app.use(shopRoutes);
app.use(wishlistRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

//default 404 error page
app.use('/', (req, res, next) => {
    res.status(404).render('admin/404');
});

app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).render('admin/500');
})

mongoose.connect('mongodb+srv://johnny:12345678%2B%2B--@johnny-u8qnc.mongodb.net/shop', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        //port to listen on
        console.log('connected');
        app.listen(3000);
    })
    .catch((err) => {
        console.log(err);
    })