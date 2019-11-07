const Venue = require('../models/venues.model');
const User = require ('../models/users.model');

// View venues
exports.list = function(req, res){
    if (req.query.minStarRating) {
        if (req.query.minStarRating > 5 || req.query.minStarRating < 1) {
            res.sendStatus(400);
            return;
        }
        if (req.query.maxCostRating > 4 || req.query.maxCostRating < 0) {
            res.sendStatus(400);
            return;
        }
        if (req.query.myLatitude > 90 || req.query.myLatitude < -90) {
            res.sendStatus(400);
            return;
        }
        if (req.query.myLongitude > 180 || req.query.myLongitude < -180) {
            res.sendStatus(400);
            return;
        }
    }
    Venue.getAll(req, function(results){
        if (!Array.isArray(results)) {
            res.sendStatus(400);
        } else {
            res.status(200).json(results);
        }
    });
};

// Add a new venue
exports.create = function(req, res){
    let token = req.get('X-Authorization');
    let venue_data = {
        "venueName": req.body.venueName,
        "categoryId": req.body.categoryId,
        "city": req.body.city,
        "shortDescription": req.body.shortDescription,
        "longDescription": req.body.longDescription,
        "address": req.body.address,
        "latitude": req.body.latitude,
        "longitude": req.body.longitude
    };
    if (token) {
        Venue.insert(venue_data, token, function(results) {
            if (results === "Bad Request") {
                res.sendStatus(400);
            } else if (results === "Unauthorised") {
                res.sendStatus(401);
            } else if (results === "500") {
                res.sendStatus(500);
            } else {
                res.status(201).json(results);
            }
        });
    } else {
        res.sendStatus(401);
    }
};

// Retrieve detailed information about a venue
exports.read = function(req, res){
    let id = req.params.id;
    Venue.getOne(id, function(results){
        if (results === "Bad Request") {
            res.sendStatus(404);
        } else {
            res.status(200).json(results);
        }
    });
};

// Change a venues details
exports.update = function(req, res){
  let token = req.get('X-Authorization');
  let venueId = req.params.id;
  let venue_data = {
      "venueName": req.body.venueName,
      "categoryId": req.body.categoryId,
      "city": req.body.city,
      "shortDescription": req.body.shortDescription,
      "longDescription": req.body.longDescription,
      "address": req.body.address,
      "latitude": req.body.latitude,
      "longitude": req.body.longitude
  };
  if (token) {
      Venue.alter(venueId, venue_data, token, function(results){
          if (results === "Bad Request") {
              res.sendStatus(400);
          } else if (results === "Unauthorised") {
              res.sendStatus(403);
          } else if (results === "500") {
              res.sendStatus(500);
          } else {
              res.status(200).json(results);
          }
      });
  } else {
      res.sendStatus(401);
  }
};

// Retrieve all data about venue categories
exports.retrieve = function(req, res){
    Venue.catergory(function(results){
        res.json(results);
    })
};


