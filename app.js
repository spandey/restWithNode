const express = require("express");
const bodyParser = require("body-parser");
const feedRoute = require('./routes/feed');
const app = express();

//app.use(bodyParser.json()); // application/json 
// we can use here    
app.use(express.json()); // application/json

//for header setting we can create middleware

app.use((req,res,next)=> {
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();

})

app.use('/feed', feedRoute);


const port = process.env.port || 3008
app.listen(port, ()=> console.log("server is running on port ...."+ port))