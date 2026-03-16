// app.use((req, res)=>{
//     res.send("Hello from the server")
// })
// app.use("/test", (req, res)=>{
//     res.send("Hello from the test")
// })

// app.use("/hello", (req, res)=>{
//     res.send("Hello Hello Hello")
// })

// app.use("/namaste", (req, res)=>{
//     res.send("Namaste Ji 🙏")
// })

// app.get("/user", (req, res)=>{
//     res.send({firstName:"Anuj", lastName:"Kamboj" })
// })

// app.post("/user", (req, res)=>{
//     res.send("Data successfully saved to the database")
// })

// app.put("/user", (req, res)=>{
//     res.send({firstName:"Anuj2", lastName:"Kamboj2" })
// })

// app.patch("/user", (req, res)=>{
//     res.send({firstName:"Anuj", lastName:"Kamboj", city:"Gurugram" })
// })

// app.delete("/user", (req, res)=>{
//     res.send("Deleted User successfully")
// })

app.use("/admin", (req, res, next)=>{
    console.log("Admin auth is getting checked")
    const token = "xyz"
    const isAdminAuthorized = token === "xyz";
    if(!isAdminAuthorized){
        res.status(401).send("Unauthorized Request")
    }else{
        next();
    }
})

app.get("/admin/getAllData", (req, res)=>{
    res.send("All Data sent")
})

app.get("/admin/deleteAllData", (req, res)=>{
    res.send("All Data deleted")
})

app.get(
  "/user",
  (req, re, next) => {
    console.log("Handling the route user");
    next();
  },
  (req, res, next) => {
    console.log("Handling the route user 2");
    // res.send("2nd Response!!");
    next();
  },
  (req, res, next) => {
    res.send("Final Response!!");
    // next()
  },
);