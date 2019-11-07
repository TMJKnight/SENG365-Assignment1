const db = require('../../config/db');
const fs = require ('fs');
const User = require('./users.model');



// USER PHOTOS


// Retrieve a user's profile photo
exports.getUserPhoto = function (userId, done) {
    db.getPool().query('SELECT profile_photo_filename FROM User WHERE user_id = ?',
        [userId], function (err, results) {
        if (err) {
            return done(404)
        } else if (results.length) {
            if(results[0].profile_photo_filename) {
                return done(200, results[0].profile_photo_filename);
            } else {
                return done(404);
            }
        } else {
            return done(404);
        }
    });
};



// Set a user's profile photo
exports.addUserPhoto = function (userId, imageType, token, photo, done) {
    db.getPool().query("SELECT user_id FROM User WHERE auth_token = ? ", [token], function (err, results) {
        if (err) {
            return done(400);
        } else {
            if (results.length) {
                let id = results[0].user_id;
                db.getPool().query("SELECT * FROM User WHERE user_id = ?", [userId], function (err, results) {
                    if (err) {
                        return done(400);
                    } else {
                        if (!results.length) {
                            return done(404);
                        } else if (id !== userId) {
                            return done(403);
                        } else {
                            if (!fs.existsSync("pictures")) {
                                fs.mkdirSync("pictures")
                            }
                            if (!fs.existsSync("pictures/user")) {
                                fs.mkdirSync("pictures/user")
                            }
                            if (!fs.existsSync("pictures/user/" + userId)) {
                                fs.mkdirSync("pictures/user/" + userId)
                            }
                            let fileLocation = "pictures/user/" +userId + "/profile_photo" + imageType;
                            fs.writeFileSync(fileLocation, photo);
                            db.getPool().query('SELECT profile_photo_filename FROM User WHERE user_id = ? ;' +
                                ' UPDATE User SET profile_photo_filename = ? WHERE user_id = ?', [userId, fileLocation, userId], function (err, results) {
                                if (err) {
                                    return done(400)
                                } else {
                                    if (results.length) {
                                        if (results[0][0].profile_photo_filename) {
                                            return done(200);
                                        } else {
                                            return done(201);
                                        }
                                    } else {
                                        return done(400);
                                    }
                                }
                            });
                        }
                    }
                });
            } else {
                return done(404);
            }
        }
    });
};




// Delete a user's profile photo
exports.deleteUserPhoto = function (userId, token, done) {
    db.getPool().query("SELECT user_id FROM User WHERE auth_token = ? ", [token], function (err, results) {
        if (err) {
            return done(404);
        } else {
            if (results.length) {
                let id = results[0].user_id;
                db.getPool().query("SELECT * FROM User WHERE user_id = ?", [userId], function (err, results) {
                    if (err) {
                        return done(err);
                    } else {
                        if (!results.length) {
                            return done(404);
                        } else if (id === userId) {
                            db.getPool().query('SELECT profile_photo_filename FROM User WHERE user_id = ? ;' +
                                ' UPDATE User SET profile_photo_filename = null WHERE user_id = ?', [userId, userId], function (err, results) {
                                if (err) {
                                    return done(err);
                                } else {
                                    if (!results.length) {                     // Check length
                                        return done(404)
                                    }
                                    if (!results[0][0].profile_photo_filename) {
                                        return done(404);
                                    }
                                    if (fs.existsSync(results[0][0].profile_photo_filename)) {
                                        fs.unlinkSync(results[0][0].profile_photo_filename);
                                        return done(200);
                                    } else {
                                        return done(404);
                                    }
                                }
                            });
                        } else {
                            return done(403);
                        }
                    }
                });
            } else {
                return done(404);
            }
        }
    });
};



// VENUE PHOTOS


// Add a photo to a venue
exports.addVenuePhoto = function (venueId, photoDescription, photo, token, makePrimaryPhoto,  done) {
    db.getPool().query("SELECT user_id FROM User WHERE auth_token = ? ", [token], function (err, results) {
        if (!err) {
            if (results.length) {
                let id = results[0].user_id;
                db.getPool().query("SELECT * FROM Venue WHERE venue_id = ?", [venueId], function (err, results) {
                    if (!err) {
                        if (!results.length) {
                            return done(404);
                        } else if (id === results[0].admin_id) {
                            db.getPool().query('SELECT * FROM VenuePhoto WHERE venue_id = ? AND is_primary = 1 ', [venueId],
                                function (err, results) {
                                    if (err) {
                                        return done(400);
                                    } else {
                                        if (photoDescription && (makePrimaryPhoto === 'true' || makePrimaryPhoto === 'false')) {
                                            let fileExtension = photo.filename + "." + photo.mimetype.toString().replace("image/", "");
                                            let filePath = "pictures/venues/" + venueId + "/" + fileExtension;
                                            if (results.length) {
                                                if (makePrimaryPhoto.toString() === 'false') {
                                                    db.getPool().query('INSERT INTO VenuePhoto(venue_id, photo_filename, photo_description, is_primary)' +
                                                        ' VALUES (?)', [[venueId, fileExtension, photoDescription, makePrimaryPhoto]], function (err) {
                                                        if (err) {
                                                            return done(err);
                                                        } else {
                                                            if (!fs.existsSync("pictures")) {
                                                                fs.mkdirSync("pictures")
                                                            }
                                                            if (!fs.existsSync("pictures/venues")) {
                                                                fs.mkdirSync("pictures/venues")
                                                            }
                                                            if (!fs.existsSync("pictures/venues/" + venueId)) {
                                                                fs.mkdirSync("pictures/venues/" + venueId)
                                                            }
                                                            fs.renameSync(photo.path, filePath);
                                                        }
                                                    });
                                                } else {
                                                    db.getPool().query('UPDATE VenuePhoto SET is_primary = 0 WHERE venue_id = ? AND is_primary = 1', [venueId], function (err) {
                                                        if (err) {
                                                            return done(err);
                                                        } else {
                                                            db.getPool().query('INSERT INTO VenuePhoto(venue_id, photo_filename, photo_description, is_primary)' +
                                                                ' VALUES (?)', [[venueId, fileExtension , photoDescription, makePrimaryPhoto]], function (err) {
                                                                if (err) {
                                                                    return done(err);
                                                                } else {
                                                                    if (!fs.existsSync("pictures")) {
                                                                        fs.mkdirSync("pictures")
                                                                    }
                                                                    if (!fs.existsSync("pictures/venues")) {
                                                                        fs.mkdirSync("pictures/venues")
                                                                    }
                                                                    if (!fs.existsSync("pictures/venues/" + venueId)) {
                                                                        fs.mkdirSync("pictures/venues/" + venueId)
                                                                    }
                                                                    fs.renameSync(photo.path, filePath);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            } else {
                                                db.getPool().query('INSERT INTO VenuePhoto(venue_id, photo_filename, photo_description, is_primary)' +
                                                    ' VALUES (?)', [[venueId, fileExtension, photoDescription, 1]], function (err) {
                                                    if (err) {
                                                        return done(err);
                                                    } else {
                                                        if (!fs.existsSync("pictures")) {
                                                            fs.mkdirSync("pictures")
                                                        }
                                                        if (!fs.existsSync("pictures/venues")) {
                                                            fs.mkdirSync("pictures/venues")
                                                        }
                                                        if (!fs.existsSync("pictures/venues/" + venueId)) {
                                                            fs.mkdirSync("pictures/venues/" + venueId)
                                                        }
                                                        fs.renameSync(photo.path, filePath);
                                                    }
                                                });
                                            }
                                            return done(201);
                                        } else {
                                            return done(400);
                                        }
                                    }
                                });
                        } else {
                            return done(403);
                        }
                    } else {
                        return done(400);
                    }
                });
            } else {
                return done(401);
            }
        } else {
            return done(400);
        }
    });
};


// Delete a venue's photo
exports.deletePhoto = function (venueId, token, photoFilename, done) {
    db.getPool().query("SELECT user_id FROM User WHERE auth_token = ? ", [token], function (err, results) {
        if (err) {
            return done(400);
        } else {
            if (results.length) {
                let id = results[0].user_id;
                db.getPool().query("SELECT * FROM Venue WHERE venue_id = ?", [venueId], function (err, results) {
                    if (err) {
                        return done(400);
                    } else {
                        if (!results.length) {
                            return done(404);
                        } else if (id === results[0].admin_id) {
                            const photoFilePath = "pictures/venues/" + venueId + "/" + photoFilename;
                            try {
                                fs.unlinkSync(photoFilePath);
                            } catch (error) {
                                return done(404);
                            }
                            db.getPool().query("SELECT is_primary as isPrimary FROM VenuePhoto WHERE " +
                                "venue_id = ? AND photo_filename = ?;" +
                                "DELETE FROM VenuePhoto WHERE venue_id = ? AND " +
                                "photo_filename = ?;" , [venueId, photoFilename, venueId, photoFilename], function (err, results) {
                                if (!err) {
                                    if (!(results[0][0].is_primary)) {
                                        return done(200);
                                    } else {
                                        db.getPool().query("UPDATE VenuePhoto SET is_primary = 1 WHERE venue_id = ? LIMIT 1;",
                                            [venueId], function (err) {
                                                if (!err) {
                                                    return done(200);
                                                } else {
                                                    return done(err);
                                                }
                                            });
                                    }
                                } else {
                                    return done (err);
                                }
                            });
                        } else {
                            return done(403);
                        }
                    }
                });
            } else {
                return done(401);
            }
        }
    });
};


// Set a photo as the primary one for this venue
exports.setPhotoPrimary = function (venueId, token, photoFilename, done) {
    db.getPool().query("SELECT user_id FROM User WHERE auth_token = ? ", [token], function (err, results) {
        if (!err) {
            if (results.length) {
                let id = results[0].user_id;
                const photoFilePath = "pictures/venues/" + venueId + "/" + photoFilename;
                db.getPool().query("SELECT * FROM Venue " +
                    "LEFT JOIN VenuePhoto ON Venue.venue_id = VenuePhoto.venue_id " +
                    "WHERE Venue.venue_id = ? AND photo_filename = ?", [venueId, photoFilePath], function (err, results) {
                    if (!err) {
                        if (!results.length) {
                            return done(404);
                        } else if (id === results[0].admin_id) {
                            db.getPool().query("UPDATE VenuePhoto SET is_primary = " +
                                "IF(photo_filename = ?, 1, 0) WHERE venue_id = ?", [photoFilePath, venueId], function (err) {
                                if (!err) {
                                    return done(200);
                                } else {
                                    return done(err);
                                }
                            });
                        } else {
                            return done(403);
                        }
                    } else {
                        return done(400);
                    }
                });
            } else {
                return done(401);
            }
        } else {
            return done(400);
        }
    });
};