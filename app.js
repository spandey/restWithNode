const multer = require("multer");
const path = require("path");
const mongoose = require('mongoose');
const express = require("express");
//const bodyParser = require("body-parser");
const feedRoute = require('./routes/feed');
const authRoutes = require('./routes/auth');
const app = express();


// create fileStorage and fileFliter for upload a file by multer

const fileStorage  = multer.diskStorage({
 destination: (req, file, cb) => {
    cb(null, 'images');
 },
 filename : (req,file,cb) => {
    cb(null, new Date().toISOString() +'-'+ file.originalname)
 }
})
const fileFilter = (req,file,cb)=>{
    if(
        file.mimetype == "image/png" || 
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/jpeg"
        
        ){
        cb(null,true)

    }
    else {
        cb(null, false)
    }

}
//app.use(bodyParser.json()); // application/json 
// we can use here    
app.use(express.json()); // application/json

// add muleter
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

// To set images folder static path use express static and by path.join we can add absolute path of directory whether express is running on othet path
app.use('/images', express.static(path.join(__dirname, 'images')));
//for header setting we can create middleware

app.use((req,res,next)=> {
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();

})

app.use('/feed', feedRoute);
app.use('/auth', authRoutes);

// error handler
app.use(function (req, res, next) {
    console.log("404 not found");
    var err = new Error('404 page Not Found');
    err.status = 404;
    next(err);
  });
  
app.use(function (err, req, res, next) {
    
// render the error page
const data = err.data;
const statusCode = err.status || 500;
res.status(statusCode).json({ message: err.message, data:data });
});

const port = process.env.port || 3008


mongoose
    .connect('mongodb://localhost:27017/restWithNode')
    .then(   app.listen(port, ()=> console.log("server is running on port ...."+ port)))
    .catch(err=>console.log(err))
//
// const username = "<mongodb username>";
// const password = "<password>";
// const cluster = "<cluster name>";
// const dbname = "myFirstDatabase";

// mongoose.connect(
//   `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`, 
//   {
//     useNewUrlParser: true,
//     useFindAndModify: false,
//     useUnifiedTopology: true
//   }
// );