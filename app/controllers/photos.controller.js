const Photo = require('../models/photos.model');
const User = require ('../models/users.model');
const fs = require('fs');
const path = require('path');


// USER PHOTOS


// Retrieve a user's profile photo
exports.readUser = function(req, res) {
    let userId = req.params.id;
    if(!userId) {
        return res.sendStatus(404);
    } else {
        Photo.getUserPhoto(Number(userId), function(err, photo) {
            if(photo) {
                if(fs.existsSync(photo)) {
                    const fileLocation = path.resolve(path.dirname(__filename), "../../") + "/" + photo;
                    return res.sendFile(fileLocation);
                }
            }
            return res.sendStatus(err);
        });
    }
};


// Set a user's profile photo
exports.createUser = function(req, res) {
    let token = req.get('X-Authorization');
    let imageType = req.get('Content-Type');
    let userId = req.params.id;
    if (token) {
        if (imageType && userId) {
            if (imageType === "image/jpeg") imageType = ".jpg";
            else if(imageType === "image/png") imageType = ".png";
            else {
                res.sendStatus(400);
                return;
            }
            Photo.addUserPhoto(Number(userId), imageType, token, req.body,function(results) {
                return res.sendStatus(results);
            });
        } else {
            res.sendStatus(400);
        }
    } else {
        res.sendStatus(401);
    }

};


// Delete a user's profile photo
exports.removeUser = function (req, res) {
    let token = req.get('X-Authorization');
    let userId = req.params.id;
    if (!token) {
        return res.sendStatus(401);
    } else {
        Photo.deleteUserPhoto(Number(userId), token ,function(results){
            return res.sendStatus(results);
        });
    }
};



// VENUE PHOTOS


// Add a photo to a venue
exports.createVenue = function (req, res) {
    let token = req.get('X-Authorization');
    let venueId = req.params.id;
    let photoDescription = req.body.description;
    let makePrimaryPhoto = req.body.makePrimary;
    let photos = req.files;
    if (!token) {
        try {
            fs.unlink(photos[0].path)
        } catch (err){}
        return res.sendStatus(401);
    } else {
        if (!(photos ||venueId)) {
            if (photos) {
                fs.unlinkSync(photos.photo[0].path)
            }
            return res.sendStatus(400)
        } else {
            let photo = photos.photo[0];
            if (photo.mimetype === "image/jpeg" || photo.mimetype === "image/png") {
                Photo.addVenuePhoto(Number(venueId), photoDescription, photo, token, makePrimaryPhoto, function (results) {
                    if (results >= 400) {
                        fs.unlinkSync(photos.photo[0].path);
                    }
                    return res.sendStatus(results)
                });
            } else {
                res.sendStatus(400);
            }
        }
    }
};



// Retrieve a given photo for a venue
exports.readVenue = function (req, res) {
    let venueId = req.params.id;
    let filename = req.params.photoFilename;
    if (!(venueId || filename)) {
        res.sendStatus(404);
    } else {
        let filePath = "pictures/venues/" + venueId + "/" + filename;
        if (fs.existsSync(filePath)) {
            const filepath = path.resolve(path.dirname(__filename), "../../") + "/" + filePath;
            res.sendFile(filepath);
        } else {
            res.sendStatus(404);
        }
    }
};


// Delete a venue's photo
exports.removeVenue = function (req, res ) {
    let token = req.get('X-Authorization');
    let venueId = req.params.id;
    let filename = req.params.photoFilename;
    if (!token) {
        res.sendStatus(401);
    } else {
        if (!(venueId || filename)) {
            res.sendStatus(404);
        } else {
            Photo.deletePhoto(venueId, token, filename, function (results) {
                res.sendStatus(results);
            });
        }
    }
};


// Set a photo as the primary one for this venue
exports.primary = function (req, res) {
    let token = req.get('X-Authorization');
    let venueId = req.params.id;
    let filename = req.params.photoFilename;
    if (!token) {
        res.sendStatus(401);
    } else {
        if (!(venueId || filename)) {
            res.sendStatus(404);
        } else {
            Photo.setPhotoPrimary(venueId, token, filename, function (results) {
                res.sendStatus(results);
            });
        }
    }
};