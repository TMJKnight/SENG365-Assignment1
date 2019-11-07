const db = require('../../config/db');
const crypto = require('crypto');

// Register as a new user
exports.insert = function(user, userName, done){
    user[4] = crypto.randomBytes(16).toString('hex');
    let values = [[user]];
    db.getPool().query('INSERT INTO User (username, email, given_name, family_name, password) VALUES ?', values, function (err, result) {
        if (err) return done("Bad Request");
        db.getPool().query('SELECT user_id from User WHERE username = ?', userName, function(err, rows){
            if (err) return done("Bad Request");
            if (rows.length === 1) {
                return done ({"userId": rows[0].user_id});
            } else {
                return done("Bad Request");
            }
        });
    });
};


// Checks if use details are correct to login
exports.certify = function (username, email, password, done) {
    db.getPool().query("SELECT user_id, password FROM User WHERE username = ? OR email = ?", [username, email], function(err, results) {
        if (err) return done(err);
        else if (results.length ===0) {
            return done("Bad Request");
        } else {
            if (results[0].password === password) {
                return done(results[0].user_id);
            } else {
                return done("Bad Request");
            }
        }
    });
};


// Gets a token
exports.getToken = function(userId, done) {
    if (userId) {
        db.getPool().query("SELECT auth_token FROM User WHERE user_id = ?", userId, function (err, results) {
            if (err) return done("Bad Request");
            else if (results.length === 0) {
                return done(null, null);
            }else {
                return done(null, results[0].auth_token);
            }
        });
    } else {
        return done("Undefined ID");
    }
};


// Sets a token
exports.setToken = function(userId, done) {
    let token = crypto.randomBytes(16).toString('hex');
    db.getPool().query("UPDATE User Set auth_token = ? WHERE user_id = ?", [token, userId], function (err) {
        if (err) return done("Bad Request");
        return done (err, token);
    });
};


// Gets Id from a token
exports.getId = function(token, done) {
    if (token) {
        db.getPool().query("SELECT user_id FROM User WHERE auth_token = ?", [token], function(err, results) {
            if (err || results.length === 0){
                return done(err, null);
            } return done(null, results[0].user_id);
        });
    } else {
        return done(true, null);
    }
};


// Deletes a token
exports.deleteToken = function(token ,done) {
    db.getPool().query("UPDATE User SET auth_token = null WHERE auth_token = ?", [token], function (err, results) {
        if (err) return done (err, results);
        return done (err, results);
    });
};


// Retrieve information about a user who is authorised
exports.getOne = function(userId, done){
    db.getPool().query('SELECT username, ' +
        'email, ' +
        'given_name AS givenName, ' +
        'family_name AS familyName  ' +
        'FROM User WHERE user_id = ?', userId, function (err, rows){
        if (err) return done(err);
        return done(rows);
    });
};


// Retrieve information about a user who is not authorised
exports.getOneUnauthorised = function(userId, done){
    db.getPool().query('SELECT username, ' +
        'given_name AS givenName, ' +
        'family_name AS familyName  ' +
        'FROM User WHERE user_id = ?', userId, function (err, rows){
        if (err) return done(err);
        return done(rows);
    });
};


// Change a users details
exports.alter = function(user_data, userId, token, done){
    let queryList = [];
    let query = "UPDATE User SET ";
    if (user_data.givenName || user_data.familyName || user_data.password) {
        if (user_data.givenName) {
            query += "given_name = ?, ";
            queryList.push(user_data.givenName);
        }
        if (user_data.familyName !== undefined) {
            if (user_data.familyName.toString() === "") {
                return done("Bad Request");
            } else {
                query += "family_name = ?, ";
                queryList.push(user_data.familyName);
            }
        }
        if (user_data.password) {
            if (isNaN(user_data.password)) {
                query += "password = ?, ";
                queryList.push(user_data.password);
            } else {
                return done("Bad Request");
            }
        }
        query = query.slice(0, -2);                 // Get rid of final comma
        query += " WHERE user_id = ?";
        queryList.push(userId);
        db.getPool().query("SELECT user_id FROM User WHERE auth_token = ?", [token], function(err, results) {
            if (err) {
                return done("500");
            } else {
                if (results[0].user_id.toString() !== userId.toString()) {
                    return done("Forbidden");
                } else {
                    db.getPool().query(query, queryList, function (err, results) {
                        if (err) {
                            return done("500");
                        } else {
                            return done("OK");
                        }
                    })
                }
            }
        })
    } else {
        return done("Bad Request");
    }
};




