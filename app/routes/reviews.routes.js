const reviews = require('../controllers/reviews.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/venues/:id/reviews')
        .get(reviews.read)
        .post(reviews.create);

    app.route(app.rootUrl + '/users/:id/reviews')
        .get(reviews.retrieve);
};