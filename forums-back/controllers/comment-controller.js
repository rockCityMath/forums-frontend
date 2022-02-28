const Post = require('../models/post-model')
const User = require('../models/user-model')
const Comment = require('../models/comment-model');
const { response } = require('express');

addComment = async(req, res) => {
    const body = req.body

    /* CREATE COMMENT OBEJCT */
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide comment info',
        })
    }

    //Modify if model changes
    const comment = new Comment({
        postID: req.params.id,
        userID: body.userID,
        content: body.content
    }); 

    if (!comment) {
        console.log("400 error")
        return res.status(400).json({ success: false, error: err })
    }

    comment
        .save()
        .then(() => {
            return res.status(201).json({
                success: true,
                id: comment._id,
                message: 'Comment created!',
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'Unable to create comment!',
            })
        })

    /* ADD COMMENT TO POST COMMENTS */
    await Post.findOne({_id: req.params.id }, (err, post) => {
        
        if(err) {
            return res.status(404).json({
                err,
                message: 'Post not found',
            })
        }
        

        //Add commentID to post's comment list
        post.comments.push(comment._id);

            post
                .save()
                .then(() => {
                    return res.status(200).json({
                        success: true,
                        id: post._id,
                        message: 'Comment added to post!'
                    })
                })
                .catch(error => {
                    return res.status(404).json({
                        error,
                        message: 'Error adding comment to post...'
                    })
                })

    }).clone()

    /* ADD COMMENT TO USER COMMENTS */
    await User.findOne({_id: body.userID }, (err, user) => {
        
        if(err) {
            return res.status(404).json({
                err,
                message: 'User not found',
            })
        }
        

        //Add commentID to user's comment list
        user.comments.push(comment._id);

            user
                .save()
                .then(() => {
                    return res.status(200).json({
                        success: true,
                        id: post._id,
                        message: 'Comment added to user!'
                    })
                })
                .catch(error => {
                    return res.status(404).json({
                        error,
                        message: 'Error adding comment to user...'
                    })
                })

    }).clone()

}

removeComment = async(req, res) => {
    const body = req.body

    /* REMOVE COMMENT OBEJCT */
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide comment info',
        })
    }

    var commentID = req.body.commentID

    await Comment.findOneAndDelete({ _id: commentID}, (err, comment) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }

        if (!comment) {
            return res
                .status(404)
                .json({ success: false, error: `Comment not found` })
        }

        return res.status(200).json({ success: true })
    }).clone().catch(err => console.log(err))

    /* REMOVE COMMENT FROM POST'S COMMENT LIST */
    Post.findOne({_id: req.params.id }, (err, post) => {
        
        if(err) {
            return res.status(404).json({
                err,
                message: 'Post not found',
            })
        }

        //Check that there is a userID provided
        var commentID = body.commentID
        if(commentID == 'undefined') {
            return res.status(404).json({
                err,
                message: 'You must provide a commentID',
            })
        }

        //Check for commentID in post's list of comments
        var comments = post.comments
        var found = comments.findIndex(function(element) {
            if(element == commentID) {
                return true
            }
        })

        //Remove comment if its found
        if(found != -1) {
            post.comments.splice(found, 1);
            post
                .save()
                .then(() => {
                    return res.status(200).json({
                        success: true,
                        id: post._id,
                        message: 'Comment removed!'
                    })
                })
                .catch(error => {
                    return res.status(404).json({
                        error,
                        message: 'Error removing comment...'
                    })
                })
        }
        else {
            return res.status(404).json({
                err,
                message: 'This comment does not exist...',
            })
        }

    }).clone()

    /* REMOVE COMMENT FROM USER'S  */

    


}

module.exports = {
    addComment,
    removeComment
}