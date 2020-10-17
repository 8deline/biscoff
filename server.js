// =======================================
//              DEPENDENCIES
// =======================================
require('dotenv').config()//dotenv is for us to manipulate the env
//.env.example is what we would push to github so that other people would know what they need to key in
const express = require('express')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const session = require('express-session')
const productsController = require('./controllers/ProductsController')
const productsRatingsController = require('./controllers/ProductRatingsController')
const usersController = require('./controllers/UsersController')
const app = express();
const port = 5000;

const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`
mongoose.set('useFindAndModify', false)

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(methodOverride('_method'))
app.use(express.urlencoded({
  extended: true
}))
//secret is your key 
app.use(session({
  secret: process.env.SESSION_SECRET,
  name: "app_session",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 3600000 } // 3600000ms = 3600s = 60mins, cookie expires in an hour
}))
//coookie is unique to differeent browsers.. if you logged in using chrome, then using safari you will b logged out cos they are diff cookie
// what happens if we restart our server

//app.use(someMiddleware) the purpose of app.use is to ensure that the entire app use this apply for all routes globally

app.use()

// index route
app.get('/products', productsController.listProducts)

// new route
app.get('/products/new', productsController.newProduct)

// show route
app.get('/products/:slug', productsController.showProduct)

// create route
app.post('/products', productsController.createProduct)

// edit route
app.get('/products/:slug/edit', productsController.showEditForm)

// update route
app.patch('/products/:slug', productsController.updateProduct)

// delete route
app.delete('/products/:slug', productsController.deleteProduct)

// product rating new route
app.get('/products/:slug/ratings/new', productsRatingsController.newProductRatingForm)

// product rating create route
app.post('/products/:slug/ratings', productsRatingsController.createProductRating)

// user registration form route
app.get('/users/register', usersController.showRegistrationForm)

// user registration
app.post('/users/register', usersController.register)

// user login form route
app.get('/users/login', usersController.showLoginForm)

// user login route
app.post('/users/login', usersController.login)

/**
 * USER-ONLY ROUTES
 */

 // user dashboard
 app.get('/users/dashboard', usersController.dashboard)


// connect to DB, then inititate Express app
mongoose.connect( mongoURI, { useNewUrlParser: true, useUnifiedTopology: true } )
  .then(response => {
    // DB connected successfully
    console.log('DB connection successful')

    app.listen(process.env.PORT || port, () => {
      console.log(`Biscoff Bakery app listening on port: ${port}`)
    })
  })
  .catch(err => {
    console.log(err)
  })
//middleware between route and controller 
//next is for the app to carryon the requeset to the controller

function guestOnlyMiddleware(req, res, next) {
  // check if user if logged in,
  // if logged in, redirect back to dashboard
  if (req.session && req.session.user) {
    res.redirect('/users/dashboard')
    return
  }

  next()
}

function setUserVarMiddleware(req, res, next) {
  // default user template var set to null
  res.locals.user = null

  // check if req.session.user is set,
  // if set, template user var will be set as well
  if (req.session && req.session.user) {
    res.locals.user = req.session.user
  }

  next()
}

