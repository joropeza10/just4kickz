var express         = require("express");
var router          = express.Router({mergeParams:true});
var app             = express(),
    bodyParser      = require("body-parser"),
    override        = require("method-override"),
    mongoose        = require("mongoose"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    flash           = require("connect-flash"),
    User            = require("../models/users"),
    Teams           = require("../models/teams"),
    Requests        = require("../models/requests"),
    Leagues         = require("../models/leagues");
    
// router.get("/", function(req,res){
//     res.render("landing");
// })

router.get("/:id", function(req,res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            Teams.find().where("author.id").equals(foundUser._id).exec(function(err,teams){
              if(err){
                  console.log(err);
              }else{
                  res.render("profile", {user: foundUser, team:teams});
              }  
            })
        }
    }) 
})


router.get("/:id/edit", function(req,res){
    User.findById(req.params.id, function(err, foundUser) {
        if(err){
            console.log(err);
        }else{
            res.render("edituser", {user:foundUser});
        }
    })
})

router.put("/:id",function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var newObject = {username: username, password: password};
    var editedUser = new User({
        username:username,
        password: password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone
    })
    User.findByIdAndUpdate(req.params.id, editedUser ,function(err, updatedUser){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
            res.redirect("/users/profile/" + req.params.id);
        })
        }
    })
})


router.delete("/:id", function(req,res){
    User.findByIdAndRemove(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            console.log("User Deleted: " + foundUser );
            res.redirect("/");
        }
    })
})



module.exports = router;