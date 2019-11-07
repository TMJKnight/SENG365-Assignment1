const photos = require('../controllers/photos.controller');
const multer = require ( 'multer');
const upload = multer ({dest: "pictures/venues/temp/"});
module.exports = function (app) {
    app.route(app.rootUrl + '/users/:id/photo')
        .get(photos.readUser)
        .put(photos.createUser)
        .delete(photos.removeUser);

    app.route(app.rootUrl + '/venues/:id/photos')
        .post(upload.fields([{name: "photo", maxCount: 1}]), photos.createVenue);

    app.route(app.rootUrl + '/venues/:id/photos/:photoFilename')
        .get(photos.readVenue)
        .delete(photos.removeVenue);

    app.route(app.rootUrl + '/venues/:id/photos/:photoFilename/setPrimary')
        .post(photos.primary);
};
