//Organized endpoints routes and call functions.
const express = require('express');
const router = express.Router();

const admin = require('../controllers/admin.js');
const user = require('../controllers/user.js')
const security = require('../security/token.js')

//The endpoints could have other shorter routes, but at a didactic level it is easier.
router.post('/src/backend/controllers/administrator/login', admin.login);
router.put('/src/backend/controllers/user/addUser', user.addUser);
router.post('/src/backend/controllers/user/login', user.login);
router.post('/src/backend/controllers/user/resetPassword', user.resetPassword);
router.post('/src/backend/controllers/user/changePassword', user.changePassword);

module.exports = router;