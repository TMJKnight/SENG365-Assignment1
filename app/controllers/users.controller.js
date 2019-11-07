const User = require('../models/users.model');
const validator = require("email-validator");



// Register as a new user
exports.create = function(req, res){
    if (!(validator.validate(req.body.email))) {
        res.sendStatus(400);
    } else if (req.body.username && req.body.email && req.body.password) {
        let user_data = [
            req.body.username,
            req.body.email,
            req.body.givenName,
            req.body.familyName,
            req.body.password
        ];
        User.insert(user_data, req.body.username, function(result){
            if (result === "Bad Request") {
                res.sendStatus(400);
            } else {
                res.status(201).json(result);
            }
        });
    } else {
        res.sendStatus(400);
    }
};

// Login as an existing user
exports.loginUser = function(req, res){
    if ((req.body.username || req.body.email) && req.body.password) {
        let username = req.body.username;
        let email = req.body.email;
        let password = req.body.password;
        User.certify(username, email, password, function(userId){
            if (userId === "Bad Request") {
                res.status(400).send('Username, email or password is invalid');
            } else {
                User.getToken(userId,function(err, token) {                                // User is logged in already so no token made
                    if (token) return res.status(200).json({userId: userId, token: token});
                    else {
                        User.setToken(userId, function(err, token) {                             // User is not logged in so a token is made
                            res.status(200).json({userId: userId, token: token})
                        });
                    }
                })

            }
        });
    } else {
        res.sendStatus(400);
    }
};

exports.logoutUser = function(req, res){
    let token = req.get('X-Authorization');
    User.getId(token, function(err, results){
        if (!(results)) {
            res.sendStatus(401);
        } else {
            User.deleteToken(token, function() {
                res.sendStatus(200);
            })
        }
    })
};

// Retrieve information about a user
exports.read = function(req, res){
    let userId = req.params.id;
    let token = req.get('X-Authorization');
    User.getToken(userId, function(err, tok){
        if(tok === token){
            User.getOne(userId, function (results) {
                if (results.length === 0)
                    return res.sendStatus(404);
                return res.status(200).json(results[0]);
            });
        } else {
            User.getOneUnauthorised(userId, function (results) {
                if (results.length === 0)
                    return res.sendStatus(404);
                return res.status(200).json(results[0]);
            });
        }
    })
};

// Change a users details
exports.update = function(req, res){
    let token = req.get('X-Authorization');
    let user_data = {
        givenName : req.body.givenName,
        familyName : req.body.familyName,
        password : req.body.password
    };
    let userId = req.params.id;
   if (token) {
       User.alter(user_data, userId, token, function(results) {
           if (results == "Bad Request") {
               res.sendStatus(400);
           } else if (results == "500") {
               res.sendStatus(500);
           } else if (results == 'Forbidden') {
               res.sendStatus(403);
           } else {
               res.sendStatus(200);
           }
       });
   } else {
       res.sendStatus(401);
   }
   res.status(501);
    /*User.alter(user_data, userId, function(result){
        res.json(result);
    });*/
};

