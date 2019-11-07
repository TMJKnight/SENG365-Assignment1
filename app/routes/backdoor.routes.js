const backdoor = require('../controllers/backdoor.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/reset')
        .post(backdoor.resetDB);

    app.route(app.rootUrl + '/resample')
        .post(backdoor.resample);

    app.route(app.rootUrl + '/executeSql')
        .post(backdoor.executeSql);
};
