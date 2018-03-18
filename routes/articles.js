const express = require("express");
const router = express.Router();

// User and Article Model
const Article = require("../models/article");
const User = require("../models/user");

// Add Article Route
router.get("/add", ensureAuthenticated, function(req, res) { 
    res.render("add_article", {
        title: "Add Article"
    });
 });
 
 // Add Article Route
router.post("/add", function(req, res) {
     req.checkBody('title','Title is required').notEmpty();
     //req.checkBody('author','Author is required').notEmpty();
     req.checkBody('body','Body is required').notEmpty();
 
     let errors = req.validationErrors();
     if(errors) {
         res.render("add_article", {
             title: "Add Article",
             errors: errors
         })
     } else {
         let article = new Article();
         article.title = req.body.title;
         article.author = req.user._id;
         article.body = req.body.body;
     
         article.save((err) => {
             if(err) {
                 console.log(err);
                 return
             } else {
                 req.flash("success", "Article Added")
                 res.redirect("/")
             }
         });
     }
 });
 
 // Load Edit Form
 router.get("/edit/:id", ensureAuthenticated, function(req, res) {
     if(article.author != req.user._id){
         req.flash("danger", "Not Authorized");
         req.reditect("");
     }
     Article.findById(req.params.id, (err, article) => {
         res.render("edit_article", {
             title: "Edit Article",
             article: article
         })
     })
 })
 
 // Submit Edit Form
 // Update Submit POST Route
 router.post('/edit/:id', function(req, res){
     let article = {};
     article.title = req.body.title;
     article.author = req.body.author;
     article.body = req.body.body;
   
     let query = {_id:req.params.id}
   
     Article.update(query, article, function(err){
       if(err){
         console.log(err);
         return;
       } else {
         req.flash("success", "Article Updated!");
         res.redirect('/');
       }
     });
   });
 
 router.delete("/:id", function(req, res){
    if(!req.user._id) {
        res.status(500).send();
    }

     let query = {_id: req.params.id};

     Article.findById(req.params.id, function(err, article) {
         if(article.author != req.user._id) {
            res.status(500).send();
         } else {
            Article.remove(query, function(err){
                if(err) {
                    console.log(err)
                }
                res.send("Success");
            });
         }
     })
 });

// Get Single Article Route
router.get("/:id", function(req, res) {
    Article.findById(req.params.id, (err, article) => {
        User.findById(article.author, function(err, user) {
            res.render("article", {
                article: article,
                author: user.name
            })
        })
    })
})

// Access Control with Passport
function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        req.flash("danger", "Please Login");
        res.redirect("/users/login");
    }

}

module.exports = router;