const Ride = require('../models/rideModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.scheduleRide = catchAsync(async(req, res, next) => {
    const newRide = await Ride.create({
        owner: req.user.id,
        startLocation: req.body.startLocation,
        endLocation: req.body.endLocation,
        transportMode: req.body.transportMode,
        numPassengers: req.body.numPassengers,
        route: req.body.route

    });
    res.status(200).json({
        status: 'success',
        data: {
            ride: newRide
        },
    });
})

exports.availableRide = catchAsync(async(req, res, next) => {
    const startLocation = req.body.startLocation;
    const endLocation = req.body.endLocation;

    const ridesStart = await Ride.find({
        route: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: startLocation
                },
                $maxDistance: 1000
            }
        }
    })

    const ridesEnd = await Ride.find({
        route: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: endLocation
                },
                $maxDistance: 1000
            }
        }
    })

    //intersection
    let rides = []
    if (ridesEnd && ridesStart) {
        rides = ridesStart.filter(n1 => ridesEnd.some(n2 => {
            if (JSON.stringify(n1._id) === JSON.stringify(n2._id) &&
                (calcDist(startLocation[1], startLocation[0], n1.startLocation.coordinates[1], n1.startLocation.coordinates[0]) <
                    calcDist(endLocation[1], endLocation[0], n1.startLocation.coordinates[1], n1.startLocation.coordinates[0]))
            ) {
                return true
            }
            return false
        }));
    }

    res.status(200).json({
        status: 'success',
        data: {
            rides
        },
    });
})

function calcDist(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}