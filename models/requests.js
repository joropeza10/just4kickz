var mongoose = require("mongoose");

var RequestSchema = new mongoose.Schema({
    username: String,
    teamId: String,
    author:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
})



module.exports = mongoose.model("Requests", RequestSchema);