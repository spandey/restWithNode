const { validationResult } = require('express-validator');

module.exports = {
   
    getPosts : function(req,res,next){
        let data = [{
            _id:"111",
            title: 'First Post',
            content: 'This is the first post!',
            imageUrl :'/images/osho.jpg',
            creator :{
                name:"Shambhu",
                
            },
            createdAt: new Date()
        }]
        res.status(200).json({
            posts: data
          });

    },
    createPost: function(req,res,next){
        let errors = validationResult(req);
        if(!errors.isEmpty()){
           return res.status(422).json({message:'validation faild', errors:errors.array()})
        }
       

            const title = req.body.title;
            const content = req.body.content;
            // Create post in db
          return  res.status(201).json({
                message: 'Post created successfully!',
                post: { _id: new Date().toISOString(), title: title, content: content,  imageUrl :'/images/osho.jpg',
                creator :{
                    name:"Atharv",
                    
                },
                createdAt: new Date()}
            });
        

    }
}