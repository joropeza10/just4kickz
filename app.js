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



mongoose.connect("mongodb://localhost/team_db", {useNewUrlParser: true});


app.use(require("express-session")({
    secret: "Wakkito the best dog ever lobito!",
    resave: false,
    saveUninitialized: false
}));



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");

app.use(override("_method"));


// IMPORTANT TO CHECK IF THERE IS A USER LOGGED IN!!! ///
// WORKS IN ALL .EJS FILES !!! ///
// currentUser ///
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
})


app.get("/", function(req,res){
    res.render("landing");
})


// app.use("/", authRoutes);
// app.use("/users/profile", userRoutes);
// app.use("/leagues", leagueRoutes);
// app.use("/teams", teamRoutes);

app.get("/users/profile/:id", function(req,res){
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


app.get("/users/profile/:id/edit", function(req,res){
    User.findById(req.params.id, function(err, foundUser) {
        if(err){
            console.log(err);
        }else{
            res.render("edituser", {user:foundUser});
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
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
            res.redirect("/users/profile/" + req.params.id);
        })
        }
    })
})


app.delete("/users/profile/:id", function(req,res){
    User.findByIdAndRemove(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            console.log("User Deleted: " + foundUser );
            res.redirect("/");
        }
    })
})



app.get("/pickup", function(req,res){
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
        }else{
            console.log("Team created: " + team.name);
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

app.get("/teams/:team_id/edit", function(req, res) {
    Teams.findById(req.params.team_id, function(err, foundTeam) {
        if(err){
            console.log(err);
        }else{
            res.render("editteam", {team:foundTeam});
        }
    })
})

app.put("/teams/:team_id", function(req, res) {
    Teams.findByIdAndUpdate(req.params.team_id, req.body.team, function(err, team) {
        if(err){
            console.log(err);
        }else{
            res.redirect("/teams/" + req.params.team_id);
        }
    })
})



app.delete("/teams/:team_id", function(req, res) {
    Teams.findByIdAndRemove(req.params.team_id, function(err, foundTeam){
        if(err){
            console.log(err);
        }else{
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
                }else{
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

app.post("/teams/:team_id/addplayer/:request_id", function(req,res){
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

app.delete("/teams/:team_id/addplayer/:request_id", function(req,res){
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


app.post("/teams/:team_id/removeplayer/:player_id", function(req, res) {
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
            console.log(err);
        }else{
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

app.get("/leagues/:league_id/edit", function(req,res){
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
            res.redirect("/leagues/" + req.params.league_id);
        }
    })
})

app.delete("/leagues/:league_id", function(req,res){
    Leagues.findByIdAndRemove(req.params.league_id, function(err){
        if(err){
            console.log(err)
        }else{
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
    res.redirect("/");
})




function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/login");
    }
}





app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Listening to Just4Kickz Webpage");
})
    
