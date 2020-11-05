const express = require('express');
const rideController = require('../controllers/rideController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
    .route('/scheduleRide')
    .post(rideController.scheduleRide)
    .patch(rideController.addCoPassenger);
router.post('/availableRides', rideController.availableRide);
router
    .route('/myScheduledRides')
    .get(rideController.myScheduledRides)
    .delete(rideController.deleteScheduledRide)
    .patch(rideController.updateScheduledRide);
router
    .route('/myRequestedRides')
    .get(rideController.myRequestedRides)
    .delete(rideController.deleteRequestedRide);

module.exports = router;