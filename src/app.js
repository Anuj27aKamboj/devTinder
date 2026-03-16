const express = require("express");
const connectDb = require("./config/database");
const User = require("./models/user")

const app = express();

app.use(express.json());

app.post("/signup", async (req, res)=>{
    //Creating a new instance of user model
    // const user = new User({
    //     firstName: "Amir",
    //     lastName: "Khan",
    //     emailId: "amir@khan.com",
    //     password: "amir@123"
    // });

   const user = new User(req.body);

    try{
        await user.save();
        res.send("User added successfully");
    }catch(err){
        res.status(400).send("Uh oh! Something feels wrong\n"+ err.message)
    }
})

app.get("/user", async (req, res)=>{
    const userEmail = req.body.emailId;

    try{
       const users = await User.find({emailId : userEmail})
       if(users.length === 0){
        res.status(404).send("User not found")
       }else{
        res.send(users)
       }
    }catch(err){
        res.status(400).send("Uh oh! Something feels wrong")
    }
})

app.get("/feed", async (req, res)=>{
    try{
       const users = await User.find({})
       if(users.length === 0){
        res.status(404).send("User not found")
       }else{
        res.send(users)
       }
    }catch(err){
        res.status(400).send("Uh oh! Something feels wrong")
    }
})

app.delete("/user", async (req, res)=>{
    const userId = req.body.userId;

    try{
        // const user = await User.findByIdAndDelete({_id: userId})
        const user = await User.findByIdAndDelete(userId)
        res.send("User deleted successfully")

    }catch(err){
        res.status(400).send("Uh oh! Something feels wrong")
    }
})

app.patch("/user", async (req, res)=>{
    const userId = req.body.userId;
    const data = req.body;

    try{
        const user = await User.findByIdAndUpdate({_id: userId}, data,{
            returnDocument: "after",
            runValidators: true,
        })
        res.send("User Updated successfully")

    }catch(err){
        res.status(400).send("Uh oh! Something feels wrong"+err.message)
    }
})

connectDb()
  .then(() => {
    console.log("Database connection is successful");
    app.listen(7777, () => {
      console.log("Server is successfully listening on port 7777");
    });
  })
  .catch((err) => {
    console.error("Uh Oh! Database cannot be connected");
  });
