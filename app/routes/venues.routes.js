const venues = require('../controllers/venues.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/venues')
        .get(venues.list)
        .post(venues.create);

    app.route(app.rootUrl + '/venues/:id')
        .get(venues.read)
        .patch(venues.update);

    app.route(app.rootUrl + '/categories')
        .get(venues.retrieve);
};
