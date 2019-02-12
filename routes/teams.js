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
    Teams.find({}, function(err, allTeams) {
        if(err){
            console.log("ERROR WITH TEAMS");
        }else{
            res.render("teams", {teams: allTeams});    
        }
    })
    
})

router.get("/newteam", isLoggedIn,function(req,res){
    res.render("newteam");
})

router.post("/newteam", function(req,res){
    var name = req.body.team.name;
    var image = req.body.team.image;
    var author = {
        id : req.user._id,
        username: req.user.username
    }
    var newTeam = {name: name, image:image, author: author};
    Teams.create(newTeam, function(err, team){
        if(err){
            console.log(err);
        }else{
            console.log("Team created: " + team.name);
            res.redirect("/");
        }
    })
})



router.get("/:team_id", function(req, res) {
    Teams.findById(req.params.team_id, function(err, foundTeam){
        if(err){
            console.log(err);
        }else{
            Requests.find().where("teamId").equals(foundTeam._id).exec(function(err,allRequests){
                if(err){
                    console.log(err);
                }else{
                    
                    res.render("showteam", {team:foundTeam, requests:allRequests});     
                }
            })
        }
    } )
})

router.get("/:team_id/edit", function(req, res) {
    Teams.findById(req.params.team_id, function(err, foundTeam) {
        if(err){
            console.log(err);
        }else{
            res.render("editteam", {team:foundTeam});
        }
    })
})

router.put("/:team_id", function(req, res) {
    Teams.findByIdAndUpdate(req.params.team_id, req.body.team, function(err, team) {
        if(err){
            console.log(err);
        }else{
            res.redirect("/teams/" + req.params.team_id);
        }
    })
})



router.delete("/:team_id", function(req, res) {
    Teams.findByIdAndRemove(req.params.team_id, function(err, foundTeam){
        if(err){
            console.log(err);
        }else{
            res.redirect("/teams");
        }
    })
})

router.get("/:team_id/request", function(req,res){
    res.redirect("/teams");
})

router.post("/:team_id/request", isLoggedIn,function(req,res){
    Teams.findById(req.params.team_id, function(err, foundTeam){
        if(err){
            console.log(err);
        }else{
            var username = req.user.username;
            var teamId = req.params.team_id;
            var author = {
                    id : req.user._id,
                    username: req.user.username
                }
            var newRequest = new Requests({
                username: username,
                teamId: teamId,
                author: author
            })
            Requests.create(newRequest, function(err, request){
                if(err){
                    console.log(err);
                }else{
                    console.log("Request created: " + request)
                    res.redirect("/teams/" + req.params.team_id);
                }
            })
        }
    })
})


router.get("/:team_id/addplayer/:request_id", function(req,res){
    res.redirect("/teams");
})

router.post("/:team_id/addplayer/:request_id", function(req,res){
    Requests.findById(req.params.request_id, function(err, foundRequest) {
        if(err){
            console.log(err + "Error in 1st");
        }else{
            Teams.findById(req.params.team_id, function(err, foundTeam){
                if(err){
                    console.log(err + "Error in 2nd");
                }else{
                        var id = foundRequest.author.id
                        var username = foundRequest.author.username
                        var newPlayer = {id: id, username:username}
                        foundTeam.players.push(newPlayer);
                        foundTeam.save();
                        console.log("Player added: " + username);
                        foundRequest.delete();
                        res.redirect("/teams/"+foundTeam._id);    
                }
            })
        }
    })
})

router.delete("/:team_id/addplayer/:request_id", function(req,res){
    Teams.findById(req.params.team_id, function(err, foundTeam) {
        if(err){
            console.log(err);
        }else{
             Requests.findByIdAndRemove(req.params.request_id, function(err, foundRequest) {
                if(err){
                    console.log(err);
                }else{
                    res.redirect("/teams/" + foundTeam._id);
                    console.log("REQUEST DELETED");
                }
            })
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