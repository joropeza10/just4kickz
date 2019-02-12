var express         = require("express"),
    router          = express.Router({mergeParams:true}),
    app             = express(),
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
    
    

router.get("/", function(req, res) {
    Leagues.find({}, function(err, allLeagues){
        if(err){
            console.log("ERROR WITH LEAGUES");
        }else{
            res.render("leagues", {leagues: allLeagues});   
        }
    })
})



router.get("/newleague", isLoggedIn, function(req,res){
    res.render("newleague");
})

router.post("/newleague", function(req, res) {
    var name = req.body.league.name;
    var image = req.body.league.image;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newLeague = {name: name, image:image, author:author};
    Leagues.create(newLeague, function(err, league){
        if(err){
            console.log(err);
        }else{
            res.redirect("/leagues");
            console.log("League Created: " + league);
        }
    })
})

router.get("/:league_id", function(req,res){
    Leagues.findById(req.params.league_id, function(err, foundLeague){
        if (err){
            console.log(err)
        }else{
            res.render("showleague", {league:foundLeague});
        }
    })
})

router.get("/:league_id/edit", function(req,res){
    Leagues.findById(req.params.league_id, function(err, foundLeague){
        if (err){
            console.log(err)
        }else{
            res.render("editleague", {league:foundLeague});
        }
    })
})

router.put("/:league_id", function(req,res){
    Leagues.findByIdAndUpdate(req.params.league_id, req.body.league, function(err, league){
        if(err){
            console.log(err);
        }else{
            res.redirect("/leagues/" + req.params.league_id);
        }
    })
})

router.delete("/:league_id", function(req,res){
    Leagues.findByIdAndRemove(req.params.league_id, function(err){
        if(err){
            console.log(err)
        }else{
            res.redirect("/leagues");
        }
    })
})

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/login");
    }
}


module.exports = router;