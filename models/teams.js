var mongoose = require("mongoose");

var TeamsSchema = new mongoose.Schema({
    name: String,
    image: String,
    author:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username:String
    },
    players: [{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"    
        },
        username:String
    }
    ]
})




module.exports = mongoose.model("Teams", TeamsSchema);