const users = require('../controllers/users.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/users')
        .post(users.create);

    app.route(app.rootUrl + '/users/login')
        .post(users.loginUser);

    app.route(app.rootUrl + '/users/logout')
        .post(users.logoutUser);

    app.route(app.rootUrl + '/users/:id')
        .get(users.read)
        .patch(users.update);

};