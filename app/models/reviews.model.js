const db = require('../../config/db');


// Retrieves a venue's reviews
exports.getOne = function(venueId, done){
    db.getPool().query('SELECT user_id, ' +
        'username, ' +
        'review_body, ' +
        'star_rating, ' +
        'cost_rating, ' +
        'time_posted ' +
        'FROM Review ' +
        'JOIN User ON user_id = review_author_id ' +
        'WHERE reviewed_venue_id = ?',venueId,function (err, rows) {
        if (err) {
            return done ("Bad Request");
        } else if (rows.length === 0) {
            return done ("Bad Request");
        } else {
            let reviewList = [];
            for (i = 0; i < rows.length; i++) {
                let review = {
                    reviewAuthor : {
                        userId : rows[i].user_id,
                        username : rows[i].username
                    },
                    reviewBody : rows[i].review_body,
                    starRating : rows[i].star_rating,
                    costRating : rows[i].cost_rating,
                    timePosted : rows[i].time_posted
                };
                reviewList.push(review);
            }
            return done(reviewList);
        }

    })
};

// Post a review for a venue
exports.insert = function(review, venueId, token, userId, done){
    if (review.reviewBody.length < 1) {
        return done("Bad Request");
    } else if (review.starRating < 1 || review.starRating > 5 || !Number.isInteger(review.starRating)) {
        return done("Bad Request");
    } else if (review.costRating < 0 || review.costRating > 4 || !Number.isInteger(review.costRating)){
        return done("Bad Request");
    }
    db.getPool().query("INSERT INTO Review (reviewed_venue_id, review_author_id, review_body, star_rating, cost_rating, time_posted) " +
        "VALUES (?)", [[venueId, userId, review.reviewBody, review.starRating, review.costRating, new Date()]], function (err, results) {
        if (err) {
            return done("Bad Request");
        } else {
            return done("OK")
        }
    })
};

exports.ownAndPreviousReview = function(venueId, done){
    db.getPool().query("SELECT admin_id, review_author_id " +
        "FROM Venue JOIN Review on reviewed_venue_id = venue_id " +
        "WHERE venue_id = ?", venueId, function(err, results) {
        if (err) {
            return done(err);
        }
        return done(results);
    });
};

// Retrieves all the reviews authored by a given user
exports.getOneUser = function(userId, done){
    db.getPool().query('SELECT user_id, ' +
        'username, ' +
        'review_body, ' +
        'star_rating, ' +
        'cost_rating, ' +
        'time_posted, ' +
        'venue_id, ' +
        'venue_name, ' +
        'category_name, ' +
        'city, ' +
        'short_description, ' +
        '(SELECT photo_filename FROM VenuePhoto WHERE Venue.venue_id AND VenuePhoto.is_primary = 1 LIMIT 1) AS primaryPhoto ' +
        'FROM Review JOIN Venue ON venue_id = reviewed_venue_id ' +
        'JOIN VenueCategory ON Venue.category_id = VenueCategory.category_id ' +
        'JOIN User ON review_author_id = user_id ' +
        'WHERE user_id = ?', userId, function (err, rows) {
        if (err) {
            return done ("Bad Request");
        } else if (rows.length === 0) {
            return done ("Bad Request");
        } else {
            let reviewsList = [];
            for (i = 0; i < rows.length; i++) {
                let review = {
                    reviewAuthor : {
                        userId : rows[i].user_id,
                        username : rows[i].username
                    },
                    reviewBody : rows[i].review_body,
                    starRating : rows[i].star_rating,
                    costRating : rows[i].cost_rating,
                    timePosted : rows[i].time_posted,
                    venue : {
                        venueId : rows[i].venue_id,
                        venueName : rows[i].venue_name,
                        categoryName: rows[i].category_name,
                        city : rows[i].city,
                        shortDescription : rows[i].short_description,
                        primaryPhoto : rows[i].primaryPhoto
                    }
                };
                reviewsList.push(review);
            }
            return done(reviewsList);
        }
    });
};