const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const { json } = require('express');
module.exports = {
    
    signup : function(req,res,next){
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          const error = new Error('Validation failed.');
          error.statusCode = 422;
          error.data = errors.array();
          throw error;
        }
        const email = req.body.email;
        const name = req.body.name;
        const password = req.body.password;
        bcrypt
          .hash(password, 12)
          .then(hashedPw => {
            const user = new User({
              email: email,
              password: hashedPw,
              name: name
            });
            return user.save();
          })
          .then(result => {
            res.status(201).json({ message: 'User created!', userId: result._id });
          })
          .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          }); 

    },
    login : function(req,res,next){
        const email = req.body.email;
        const password = req.body.password;
        let loadedUser;
        User
            .findOne({ email: email })
            .then(user => {
                if (!user) {
                  const error = new Error('A user with this email could not be found.');
                  error.statusCode = 401;
                  throw error;
                }
                loadedUser = user;
                return bcrypt.compare(password, user.password);

            })
            .then(isEqual => {
                if (!isEqual) {
                  const error = new Error('Wrong password!');
                  error.statusCode = 401;
                  throw error;
                }

                //jwt.sign(paylod,secret,expre)
                let paylod = { email : loadedUser.email, userId:loadedUser._id.toString()}
                let secretKey = "myfirstsupersaverjwtforathotication";
                let exp = { expiresIn: '1h' };
                const token = jwt.sign(paylod,secretKey,exp);
                res.status(200).json({ token: token, userId: loadedUser._id.toString() });
            })
            .catch(err => {
                if (!err.statusCode) {
                  err.statusCode = 500;
                }
                next(err);
              }); 


    },

    getStatus: function(req, res, next){
      User
        .findById(req.userId)
        .then(data => {
          if(!data){
            const error = new Error("Not found");
            error.statusCode = 404;
            throw error
          }
          res.status(200).json({status:data.status})
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        })

    },
    updateUserStatus : (req, res, next) => {
      const newStatus = req.body.status;
      User.findById(req.userId)
        .then(user => {
          if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
          }
          user.status = newStatus;
          return user.save();
        })
        .then(result => {
          res.status(200).json({ message: 'User updated.' });
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
      }
}