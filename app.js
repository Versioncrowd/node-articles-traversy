const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require('passport');
const config = require("./config/database");
const aws = require("aws-sdk");
// init app
const app = express();

// Bring in model
const Article = require("./models/article");

// Connection to MLAB MongoDB from Heroku env
/*let mongodbUri = new aws.S3({
    mongodbUri: process.env.S3_MONGOURI
}) */

const mongodbUri = config.database;
const options = {
    useMongoClient: true
}
mongoose.connect(mongodbUri, options);
const db = mongoose.connection;

// Check connection
db.once("open", () => {
    console.log("connected to Mongo DB")
})

// check for db errors
db.on("error", (err) => {
    console.log("err")
})

// load view engine

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Body Parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }));
  
  // Express Messages Middleware
  app.use(require('connect-flash')());
  app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
  });
  
  // Express Validator Middleware
  app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));

// Passport Config
require("./config/passport")(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Global User
app.get("*", function(req, res, next) {
    res.locals.user = req.user || null;
    next();
})

// home route
app.get("/", (req, res) => {
    Article.find({}, (err, articles) => {
        if (err) {
            console.log(err)
        } else {
            res.render("index", {
                title: "Articles",
                articles: articles
            })
        }   
    }) 
});

let articles = require("./routes/articles");
app.use("/articles", articles)
const users = require("./routes/users");
app.use("/users", users);

// start server
app.listen(3000, ()=> {
    console.log("Server started on port 3000");
});
