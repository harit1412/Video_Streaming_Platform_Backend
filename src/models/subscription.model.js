const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema({
    subscriber : { 
        type : mongoose.Schema.Types.ObjectId,  
        ref : "User"
    },
    channel : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
},{
    timestamps : true,
})

const Subscription = mongoose.model("Subsciption",subscriptionSchema)

module.exports = Subscription