const express = require('express');
const rideController = require('../controllers/rideController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.post('/scheduleRide', rideController.scheduleRide);
router.get('/availableRides', rideController.availableRide)

module.exports = router;