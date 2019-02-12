var mongoose = require("mongoose");



var LeaguesSchema = new mongoose.Schema({
    name: String,
    image: String,
    author:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username:String
    },
    teams:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teams"
    }]
})


module.exports = mongoose.model("Leagues", LeaguesSchema);