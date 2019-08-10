var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    override        = require("method-override"),
    mongoose        = require("mongoose"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    flash           = require("connect-flash"),
    User            = require("./models/users"),
    Teams           = require("./models/teams"),
    Requests        = require("./models/requests"),
    Leagues         = require("./models/leagues");
    

    
    
// var userRoutes      = require("./routes/users"),
//     authRoutes      = require("./routes/auth"),
//     leagueRoutes    = require("./routes/leagues"),
//     teamRoutes      = require("./routes/teams");


// var webRoutes = require("./routes/pages")

//MONGO REPAIR

//./mongod --repair



mongoose.connect("mongodb+srv://oropezaDev:vempfir55@cluster0-dmm0o.mongodb.net/test?retryWrites=true&w=majority", 
                {useNewUrlParser: true, useCreateIndex: true}).then(() => {
                    console.log("connected to DB Succesfully");
                }).catch(err => {
                    console.log("Error, " + err.message);
                });


app.use(require("express-session")({
    secret: "Wakkito the best dog ever lobito!",
    resave: false,
    saveUninitialized: false
}));


app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname  + "/public"))
app.set("view engine", "ejs");

app.use(override("_method"));


// IMPORTANT TO CHECK IF THERE IS A USER LOGGED IN!!! ///
// WORKS IN ALL .EJS FILES !!! ///
// currentUser ///
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})


app.get("/", function(req,res){
    res.render("landing");
})


// app.use("/", authRoutes);
// app.use("/users/profile", userRoutes);
// app.use("/leagues", leagueRoutes);
// app.use("/teams", teamRoutes);

app.get("/users/profile/:id", isLoggedIn, function(req,res){
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


app.get("/users/profile/:id/edit", isLoggedIn, function(req,res){
    User.findById(req.params.id, function(err, foundUser) {
        if(err){
            console.log(err);
            req.flash("error", err.message)
        }else{
            if(foundUser._id.equals(req.user.id)){
                res.render("edituser", {user:foundUser});   
            }else{
                req.flash("error", "You are not allowed to do that!")
                res.redirect("back");
            }
        }
    })
})

app.put("/users/profile/:id",function(req, res) {
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
            req.flash("error", err.message);
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
            req.flash("success", "Succesfully edited your profile");    
            res.redirect("/users/profile/" + req.params.id);
        })
        }
    })
})


app.delete("/users/profile/:id", function(req,res){
    User.findByIdAndRemove(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
            req.flash("error", err.message);
        }else{
            console.log("User Deleted: " + foundUser );
            req.flash("success", "Profile Deleted");
            res.redirect("/");
        }
    })
})



app.get("/pickup", isLoggedIn,function(req,res){
    res.render("pickup");
})

app.get("/register", function(req,res){
    res.render("newuser");
})

app.get("/users/profile/:id", isLoggedIn,function(req,res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            res.render("profile", {user:foundUser});    
        }
    })
})


/////////// TEAMS ////////////////

app.get("/teams", function(req, res) {
    Teams.find({}, function(err, allTeams) {
        if(err){
            console.log("ERROR WITH TEAMS");
        }else{
            res.render("teams", {teams: allTeams});    
        }
    })
    
})

app.get("/teams/newteam", isLoggedIn,function(req,res){
    res.render("newteam");
})

app.post("/teams/newteam", function(req,res){
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
            req.flash("error", err.message);
            res.redirect("back");
        }else{
            console.log("Team created: " + team.name);
            req.flash("success", "Team " + team.name  + "created");
            res.redirect("/");
        }
    })
})



app.get("/teams/:team_id", function(req, res) {
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

app.get("/teams/:team_id/edit", checkTeamOwnership,  function(req, res) {
    Teams.findById(req.params.team_id, function(err, foundTeam) {
        if(err){
            console.log(err);
        }else{
            res.render("editteam", {team:foundTeam});    
        }
    })
})

app.put("/teams/:team_id", checkTeamOwnership, function(req, res) {
    Teams.findByIdAndUpdate(req.params.team_id, req.body.team, function(err, team) {
        if(err){
            console.log(err);
        }else{
            req.flash("success", "Succesfully edited Team");
            res.redirect("/teams/" + req.params.team_id);
        }
    })
})



app.delete("/teams/:team_id", checkTeamOwnership, function(req, res) {
    Teams.findByIdAndRemove(req.params.team_id, function(err, foundTeam){
        if(err){
            console.log(err);
        }else{
            req.flash("success", "Succesfully deleted Team");
            res.redirect("/teams");
        }
    })
})

app.get("/teams/:team_id/request", function(req,res){
    res.redirect("/teams");
})

app.post("/teams/:team_id/request", isLoggedIn,function(req,res){
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
                    req.flash("error", err.message);
                }else{
                    req.flash("success", "Succesfully requested to Join team " + foundTeam.name + "!")
                    console.log("Request created: " + request)
                    res.redirect("/teams/" + req.params.team_id);
                }
            })
        }
    })
})


app.get("/teams/:team_id/addplayer/:request_id", function(req,res){
    res.redirect("/teams");
})

app.post("/teams/:team_id/addplayer/:request_id", checkTeamOwnership, function(req,res){
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
                        req.flash("success", "Player " + foundRequest.author.username + "added to your team!");
                        foundRequest.delete();
                        res.redirect("/teams/"+foundTeam._id);    
                }
            })
        }
    })
})

app.delete("/teams/:team_id/addplayer/:request_id", checkTeamOwnership, function(req,res){
    Teams.findById(req.params.team_id, function(err, foundTeam) {
        if(err){
            console.log(err);
        }else{
             Requests.findByIdAndRemove(req.params.request_id, function(err, foundRequest) {
                if(err){
                    console.log(err);
                }else{
                    req.flash("success", "Succesfully deleted player");
                    res.redirect("/teams/" + foundTeam._id);
                    console.log("REQUEST DELETED");
                }
            })
        }
    })
   
})


app.post("/teams/:team_id/removeplayer/:player_id", checkTeamOwnership, function(req, res) {
    Teams.findById(req.params.team_id, function(err, foundTeam) {
        if(err){
            console.log(err);
        }else{
            foundTeam.players.pop();
            foundTeam.save();
            res.redirect("/teams/" + foundTeam._id);
        }
    })
})

///////// LEAGUES ///////////

app.get("/leagues", function(req, res) {
    Leagues.find({}, function(err, allLeagues){
        if(err){
            console.log("ERROR WITH LEAGUES");
        }else{
            res.render("leagues", {leagues: allLeagues});   
        }
    })
})



app.get("/leagues/newleague", isLoggedIn, function(req,res){
    res.render("newleague");
})

app.post("/leagues/newleague", function(req, res) {
    var name = req.body.league.name;
    var image = req.body.league.image;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newLeague = {name: name, image:image, author:author};
    Leagues.create(newLeague, function(err, league){
        if(err){
            req.flash("error", err.message);
            console.log(err);
        }else{
            req.flash("success", "Succesfully created League");
            res.redirect("/leagues");
            console.log("League Created: " + league);
        }
    })
})

app.get("/leagues/:league_id", function(req,res){
    Leagues.findById(req.params.league_id, function(err, foundLeague){
        if (err){
            console.log(err)
        }else{
            res.render("showleague", {league:foundLeague});
        }
    })
})

app.get("/leagues/:league_id/edit", isLoggedIn, checkLeagueOwnership, function(req,res){
    Leagues.findById(req.params.league_id, function(err, foundLeague){
        if (err){
            console.log(err)
        }else{
            res.render("editleague", {league:foundLeague});
        }
    })
})

app.put("/leagues/:league_id", function(req,res){
    Leagues.findByIdAndUpdate(req.params.league_id, req.body.league, function(err, league){
        if(err){
            console.log(err);
        }else{
            req.flash("success", "Succesfully edited League");
            res.redirect("/leagues/" + req.params.league_id);
        }
    })
})

app.delete("/leagues/:league_id", checkLeagueOwnership, function(req,res){
    Leagues.findByIdAndRemove(req.params.league_id, function(err){
        if(err){
            console.log(err)
        }else{
            req.flash("success", "Succesfully deleted League");
            res.redirect("/leagues");
        }
    })
})


//// AUTHENTICATION


app.post("/register", function(req, res){
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
            req.flash("success", "Succesfully Registered");
            res.redirect("/");
        })
    })
})

app.get("/login", function(req, res) {
    res.render("login");
})


app.post("/login", passport.authenticate("local", 
    {
        successRedirect : "/",
        failureRedirect : "/login"
    }),function(req, res){
});

app.get("/logout", function(req,res){
    req.logout();
    req.flash("success", "Succesfully logged out ")
    res.redirect("/");
})


/////// MY MIDDLEWARES //////


function checkTeamOwnership(req, res, next){
    Teams.findById(req.params.team_id, function(err, foundTeam) {
        if(err){
            req.flash("error", err.message);    
            res.redirect("back");
        }else{
            if(foundTeam.author.id.equals(req.user._id)){
                next();
            }else{
                req.flash("error", "You are not the owner of this team");
                res.redirect("back");
            }
        }
        
    })
}

function checkLeagueOwnership(req, res, next){
    Leagues.findById(req.params.league_id, function(err, foundLeague) {
        if(err){
            req.flash("error", err.message)
            res.redirect("back")
        }else{
            if(foundLeague.author.id.equals(req.user._id)){
                next();
            }else{
                req.flash("error", "You are not the author of this league");
                res.redirect("back");
            }
        }
    })
}


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash("error", "You need to login ")
        res.redirect("/login");
    }
}



 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});

// app.listen(process.env.PORT || 3000, function(){
//   console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
// });



// app.listen(process.env.PORT, process.env.IP, function(){
//     console.log("Listening to Just4Kickz Webpage");
// })
    
