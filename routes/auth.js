var express         = require("express");
var router          = express.Router({mergeParams:true});
var passport        = require("passport");
var User            = require("../models/users");

    



router.get("/pickup", function(req,res){
    res.render("pickup");
})

router.get("/register", function(req,res){
    res.render("newuser");
})

router.post("/register", function(req, res){
    var newUser = new User({
            username: req.body.username, 
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone
        });
    User.register(newUser, req.body.password,function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/");
        })
    })
})

router.get("/login", function(req, res) {
    res.render("login");
})


router.post("/login", passport.authenticate("local", 
    {
        successRedirect : "/",
        failureRedirect : "/login"
    }),function(req, res){
});

router.get("/logout", function(req,res){
    req.logout();
    res.redirect("/");
})




function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/login");
    }
}

module.exports = router;
