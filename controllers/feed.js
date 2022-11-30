const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Post = require('../model/post');
// const { post } = require('../routes/feed');

module.exports = {
   
    getPosts : function(req,res,next){
        const currentPage = req.query.page || 1;
        const perPage = 2;
        let totalItems;
        Post.find()
          .countDocuments()
          .then(count => {
            totalItems = count;
            return Post.find()
              .skip((currentPage - 1) * perPage)
              .limit(perPage);
          })
          .then(posts => {
            res
              .status(200)
              .json({
                message: 'Fetched posts successfully.',
                posts: posts,
                totalItems: totalItems
              });
          })
          .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });        // Post
        // .find()
        // .then(posts =>{
        //     if(!posts){
        //         const error = new Error('Could not find post.');
        //         error.statusCode = 404;
        //         throw error;
              
        //     }
        //     res.status(200).json({
        //         posts:   posts
        //     })
        // })
        // .catch(
        //     err => {
        //         if (!err.statusCode) {
        //           err.statusCode = 500;
        //         }
        //         next(err);
        //       }
        // );

        
    },
    
    createPost: function(req,res,next){
        let errors = validationResult(req);
        if(!errors.isEmpty()){
          // return res.status(422).json({message:'validation faild', errors:errors.array()}) if catch is not available
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            throw error;
        }
        if (!req.file) {
            const error = new Error('No image provided.');
            error.statusCode = 422;
            throw error;
          }
          const imageUrl = req.file.path;

            const title = req.body.title;
            const content = req.body.content;
            const postData = new Post(
                {
                    title: title,
                    content: content,
                    imageUrl: imageUrl,
                    creator: { name: 'Shambhu' } 
                }
            )
            postData
                .save()
                .then((result)=> res.status(201).json({
                    message: 'Post created successfully!',
                    post: result
                  }))
                .catch(err=>{                
                        if (!err.statusCode) {
                          err.statusCode = 500;
                        }
                        next(err);
                      
                });
  
    },

    getPost : function(req,res,next){
        //dynamic code
        let id = req.params.postId
        Post
        .findById(id)
        .then(post =>{
            if(!post){
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
              }
            
            res.status(200).json({
                post:   post
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
            }
        );     
    },
    updatePost : function(req,res,next){
        const postId = req.params.postId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            throw error;
        }
        const title = req.body.title;
        const content = req.body.content;
        let imageUrl = req.body.image;
        if (req.file) {
            imageUrl = req.file.path;
        }
        if (!imageUrl) {
            const error = new Error('No file picked.');
            error.statusCode = 422;
            throw error;
        }
        Post
        .findById(postId)
        .then(post => {
        if (!post) {
            const error = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        return post.save();
        })
        .then(result => {
        res.status(200).json({ message: 'Post updated!', post: result });
        })
        .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
        });
    },

    deletPost: function(req,res,next) {
        let id = req.params.postId;
        Post
            .findById(id)
            .then(
                data => {
                    if(!data){
                        const error = new Error("Record Not found");
                        error.statusCode = 404
                        throw error;
                    }
                    let imageUrl = data.imageUrl;
                    if(imageUrl) {
                        clearImage(imageUrl);
                    }
                    return Post.findByIdAndRemove(id)
                    
                }
            )
            .then(result=>{
               
                res.status(200).json({message: 'Post Deleted!', post: result})

            })
            .catch(
                err => {
                    if (!err.statusCode) {
                        err.statusCode = 500;
                    }
                    next(err);
                   
                }
            )

    }
}
const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
  };