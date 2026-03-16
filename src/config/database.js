const mongoose = require("mongoose");

const connectDb = async()=>{
    await mongoose.connect("mongodb+srv://anujkamboj2000:S0fzIZUDYEDroZz9@firstcluster.97neuea.mongodb.net/devTinder")
};

module.exports = connectDb;