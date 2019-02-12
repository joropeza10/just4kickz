var mongoose = require("mongoose");
var User = require("./models/users");

var data = [
        {
            username: "Oropeza", name: "Javier Oropeza"
        }
    ]
    
    
function seedDB(){
    User.remove({}, function (err){
        if(err){
            console.log(err)
        }else{
            console.log("Users deleted");
        }
        data.forEach(function(seed){
            User.create(seed, function(err, user){
                if(err){
                    console.log(err)
                }else{
                    console.log("USERS CREATED");
                }
            })
        })
    })
}

module.exports = seedDB;