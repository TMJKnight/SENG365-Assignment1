const Review = require('../models/reviews.model');
const User = require('../models/users.model');

// Retrieves a venue's reviews
exports.read = function(req, res){
    let id = req.params.id;
    Review.getOne(id, function(results){
        if (results === "Bad Request"){
            res.sendStatus(404);
        } else {
            res.json(results);
        }
    })

};

// Post a review for a venue
exports.create = function(req, res){
    let token = req.get('X-Authorization');
    let venueId = req.params.id;
    let review_data = {
        "reviewBody" : req.body.reviewBody,
        "starRating" : req.body.starRating,
        "costRating" : req.body.costRating
    };
    if (token) {
        User.getId(token, function(err, userId){
            if (!userId) {
                res.sendStatus(401);
            } else {
                Review.ownAndPreviousReview(venueId, function(result){
                    if(result[0]['admin_id'] === userId){
                        res.sendStatus(403);
                    } else {
                        let found = false;
                        for (let i =0; i < result.length; i++) {
                            if (result[i]['review_author_id'] === userId) {
                                found = true;
                            }
                        }
                        if (found === true) {
                            res.sendStatus(403);
                        } else {
                            Review.insert(review_data, venueId, token, userId, function(results) {
                                if (results === "Bad Request") {
                                    res.sendStatus(400);
                                } else if (results === "Unauthorised") {
                                    res.sendStatus(401);
                                } else if (results === "500") {
                                    res.sendStatus(500);
                                } else {
                                    res.status(201).json(results);
                                }
                            })
                        }
                    }
                })
            }
        });
    } else {
        res.sendStatus(401);
    }

};

// Retrieves all the reviews authored by a given user
exports.retrieve = function(req,res){
    let token = req.get('X-Authorization');
    //let userId = req.params.id;
    if (token) {
        User.getId(token, function(err, userId) {
            if (!userId) {
                res.sendStatus(401);
            } else {
                Review.getOneUser(userId, function(results) {
                    if (results === "Bad Request") {
                        res.sendStatus(400);
                    } else if (results === "Unauthorised") {
                        res.sendStatus(403);
                    } else if (results === "500") {
                        res.sendStatus(500);
                    } else {
                        res.json(results);
                    }
                });
            }
        });
    }
};