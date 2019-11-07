const db = require('../../config/db');

// View venues
exports.getAll = function(req, done){
    let startIndex = req.query.startIndex;
    let count = req.query.count;
    let city = req.query.city;
    let q = req.query.q;
    let categoryId = req.query.categoryId;
    let minStarRating = req.query.minStarRating;
    let maxCostRating = req.query.maxCostRating;
    let adminId = req.query.adminId;
    let sortBy = req.query.sortBy;
    let reverseSort = req.query.reverseSort;
    let myLatitude = req.query.myLatitude;
    let myLongitude = req.query.myLongitude;
    let parameters = [];
    let query = 'SELECT Venue.venue_id AS venueId, ' +
        'venue_name AS venueName, ' +
        'category_id as categoryId, ' +
        'city, ' +
        'short_description as shortDescription, ' +
        'latitude, ' +
        'longitude, ' +
        'AVG(star_rating) as meanStarRating, ' +
        'mode_cost_rating as modeCostRating,' +
        '(SELECT photo_filename FROM VenuePhoto WHERE Venue.venue_id AND VenuePhoto.is_primary = 1 LIMIT 1) AS photoFilename';
    if (!isNaN(myLatitude) && !isNaN(myLongitude)) {
        query += `, 111.111 * DEGREES(ACOS(LEAST(COS(RADIANS(${myLatitude})) 
        * COS(RADIANS(latitude)) * COS(RADIANS(${myLongitude} - longitude)) + 
        SIN(RADIANS(${myLongitude})) * SIN(RADIANS(latitude)), 1.0))) AS distance `;
    }
    query += ' FROM Venue ' +
        'LEFT JOIN Review ON Venue.venue_id = Review.reviewed_venue_id ' +
        'LEFT JOIN ModeCostRating ON Venue.venue_id = ModeCostRating.venue_id WHERE Venue.venue_id > -1';       // The where clause is always true so the other parameters can be added to the query
    if (city) {
        parameters.push(city);
        query += " AND city = ?";
    }
    if (q) {
        query += " AND venue_name LIKE '%" + q + "%'";
    }
    if (categoryId) {
        parameters.push(categoryId);
        query += " AND category_id = ?";
    }
    if (adminId) {
        parameters.push(adminId);
        query += " AND admin_id = ?";
    }
    if (!isNaN(maxCostRating)) {
        parameters.push(maxCostRating);
        query += " AND mode_cost_rating <= ?";
    }
    query += " GROUP BY Venue.venue_id";
    if (!isNaN(minStarRating)) {
        parameters.push(minStarRating);
        query += " HAVING meanStarRating >= ?";
    }
    if(sortBy) {
        switch (sortBy) {
            case "STAR_RATING":
                query += " ORDER BY meanStarRating";
                break;
            case "COST_RATING":
                query += " ORDER BY mode_cost_rating";
                break;
            case "DISTANCE":
                if (!isNaN(myLatitude) && !isNaN(myLongitude)) {
                    query += " ORDER BY distance";
                    break;
                }
            default:
                break;
        }
    } else {
        query += " ORDER BY meanStarRating";
    }
    if (reverseSort) {
        query += " ASC";
    } else {
        query += " DESC";
    }
    db.getPool().query(query, parameters, function(err, rows) {
        if (err) return done({'ERROR' : 'Error selecting in venue ' + err});
        let start = 0;
        if (startIndex) {
            start = Number(startIndex);
        }
        if (count) {
            count = Number(count) + Number(start);
        } else {
            count = rows.length;
        }
        let output = rows.slice(start, count);
        done(output);
    });
};

// Add a new venue
exports.insert = function(venue, token, done){
    if (!venue.city) {
        return done("Bad Request");
    } else if (venue.latitude > 90.0 || venue.latitude < -90.0) {
        return done("Bad Request");
    } else if (venue.longitude < -180.0 || venue.longitude > 180.0) {
        return done("Bad Request");
    }
    db.getPool().query("SELECT user_id FROM User WHERE auth_token = ?", [token], function(err, results) {
        if (err) {
            return done("500");
        } else {
            if (results.length === 0) {
                return done("Unauthorised");
            } else {
                let userId = results[0].user_id;
                db.getPool().query("SELECT * FROM VenueCategory WHERE category_id = ?", [venue.categoryId], function (err, results) {
                    if (err) {
                        return done("Bad Request");
                    } else {
                        if (results.length === 0) {
                            return done("Bad Request")
                        } else {
                            db.getPool().query('INSERT INTO Venue (admin_id, venue_name, category_id, city, short_description, long_description, date_added, address, latitude, longitude) ' +
                                'VALUES (?)', [[userId, venue.venueName, venue.categoryId, venue.city, venue.shortDescription,
                                venue.longDescription, new Date(), venue.address, venue.latitude, venue.longitude]], function (err, results) {
                                if (err) {

                                    return done("Bad Request");
                                } else {
                                    done({"venueId": parseInt(results.insertId)});
                                }
                            });
                        }
                    }
                })
            }
        }
    })
};

// Retrieve detailed information about a venue
exports.getOne = function(venueId, done){
    db.getPool().query('SELECT venue_name, ' +
        'user_id, ' +
        'username, ' +
        'Venue.category_id, ' +
        'category_name, ' +
        'category_description, ' +
        'city, ' +
        'short_description, ' +
        'long_description, ' +
        'date_added, ' +
        'address, ' +
        'latitude, ' +
        'longitude, ' +
        'photo_filename, ' +
        'photo_description, ' +
        'is_primary ' +
        'FROM Venue ' +
        'JOIN User ON user_id = admin_id ' +
        'JOIN VenueCategory ON VenueCategory.category_id = Venue.category_id ' +
        'LEFT JOIN VenuePhoto ON VenuePhoto.venue_id = Venue.venue_id ' +
        'WHERE Venue.venue_id = ?', venueId, function (err, rows) {
        if (err) return done("Bad Request");
        else if (rows.length === 0) {
            return done("Bad Request");
        } else {
            let results = {
                "venueName": rows[0].venue_name,
                "admin": {
                    "userId": rows[0].user_id,
                    "username": rows[0].username
                },
                "category": {
                    "categoryId": rows[0].category_id,
                    "categoryName": rows[0].category_name,
                    "categoryDescription": rows[0].category_description
                },
                "city": rows[0].city,
                "shortDescription": rows[0].short_description,
                "longDescription": rows[0].long_description,
                "dateAdded": rows[0].date_added,
                "address": rows[0].address,
                "latitude": rows[0].latitude,
                "longitude": rows[0].longitude,
            };
            let photoList = [];
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].photo_filename != null) {
                    let photo = {
                        photoFilename: rows[i].photo_filename,
                        photoDescription: rows[i].photo_description,
                        isPrimary: Boolean(rows[i].is_primary)
                    };
                    photoList.push(photo);
                }
            }
            results.photos = photoList;
            return done(results);
        }

    });
};

// Change a venues details
exports.alter = function(venueId, venueData, token, done){
    let query = "UPDATE Venue SET ";
    let queryList = [];
    if (venueData.venueName || venueData.categoryId || venueData.city || venueData.shortDescription ||
    venueData.longDescription || venueData.address || venueData.latitude || venueData.longitude) {
        if (venueData.venueName) {
            query += "venue_name = ?, ";
            queryList.push(venueData.venueName);
        }
        if (venueData.categoryId) {
            query += "category_id = ?, ";
            queryList.push(venueData.categoryId);
        }
        if (venueData.city) {
            query += "city = ?, ";
            queryList.push(venueData.city);
        }
        if (venueData.shortDescription) {
            query += "short_description = ?, ";
            queryList.push(venueData.shortDescription);
        }
        if (venueData.longDescription) {
            query += "long_description = ?, ";
            queryList.push(venueData.longDescription);
        }
        if (venueData.address) {
            query += "address = ?, ";
            queryList.push(venueData.address);
        }
        if (venueData.latitude) {
            query += "latitude = ?, ";
            queryList.push(venueData.latitude);
        }
        if (venueData.longitude) {
            query += "longitude = ?, ";
            queryList.push(venueData.longitude);
        }
        query = query.slice(0, -2); // Delete the last comma
        query += " WHERE venue_id = ?";
        queryList.push(venueId);
        db.getPool().query("SELECT user_id FROM User WHERE auth_token = ?", [token], function(err, results1) {
            if (err) {
                return done("500");
            } else {
                db.getPool().query("SELECT admin_id FROM Venue WHERE venue_id = ?", [venueId], function(err, results2) {
                    if (err) {
                        return done("500");
                    } else {
                        if (results2[0].admin_id === results1[0].user_id) {
                            db.getPool().query(query, queryList, function(err, results) {
                                if (err) {
                                    return done ("Bad Request");
                                } else {
                                    return done ("OK");
                                }
                            });
                        } else {
                            return done("Unauthorised");
                        }
                    }
                })
            }
        })
    } else {
        return done ("Bad Request")
    }
};

// Retrieve all data about venue categories
exports.catergory = function(done){
    db.getPool().query("SELECT category_id AS categoryId," +
        "category_name AS categoryName," +
        "category_description AS categoryDescription" +
        " FROM VenueCategory", function (err, rows) {
        if (err) return done(err);
        return done(rows);
    })
};