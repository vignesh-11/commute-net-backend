const Ride = require('../models/rideModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.scheduleRide = catchAsync(async(req, res, next) => {
    const newRide = await Ride.create({
        owner: req.user.id,
        startLocation: req.body.startLocation,
        endLocation: req.body.endLocation,
        transportMode: req.body.transportMode,
        maxNumPassengers: req.body.maxNumPassengers,
        route: req.body.route,
        scheduledAt: req.body.scheduledAt,
    });
    res.status(200).json({
        status: 'success',
        data: {
            ride: newRide,
        },
    });
});

exports.availableRide = catchAsync(async(req, res, next) => {
    const startLocation = req.body.startLocation;
    const endLocation = req.body.endLocation;
    const dateTime = Date.parse(req.body.scheduledAt);
    const userId = req.user.id;

    const timeDiff = 7200000;

    const ridesStart = await Ride.find({
        route: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: startLocation,
                },
                $maxDistance: 1000,
            },
        },
    });

    const ridesEnd = await Ride.find({
        route: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: endLocation,
                },
                $maxDistance: 1000,
            },
        },
    });
    //intersection
    let rides = [];
    if (ridesEnd && ridesStart) {
        rides = ridesStart.filter((n1) =>
            ridesEnd.some((n2) => {
                if (
                    JSON.stringify(n1._id) === JSON.stringify(n2._id) &&
                    calcDist(
                        startLocation[1],
                        startLocation[0],
                        n1.startLocation.coordinates[1],
                        n1.startLocation.coordinates[0]
                    ) <
                    calcDist(
                        endLocation[1],
                        endLocation[0],
                        n1.startLocation.coordinates[1],
                        n1.startLocation.coordinates[0]
                    ) &&
                    n1.coPassengers.length + 1 < n1.maxNumPassengers &&
                    Date.parse(n1.scheduledAt) - timeDiff <= dateTime &&
                    dateTime <= Date.parse(n1.scheduledAt) + timeDiff &&
                    n1.owner._id != userId
                ) {
                    return true;
                }
                return false;
            })
        );
    }

    res.status(200).json({
        status: 'success',
        data: {
            rides,
        },
    });
});

exports.myScheduledRides = catchAsync(async(req, res, next) => {
    const rides = await Ride.find({
        owner: req.user.id,
    });

    res.status(200).json({
        status: 'success',
        data: {
            rides,
        },
    });
});

exports.myRequestedRides = catchAsync(async(req, res, next) => {
    const rides = await Ride.find({
        coPassengers: req.user.id,
    });

    res.status(200).json({
        status: 'success',
        data: {
            rides,
        },
    });
});

exports.updateScheduledRide = catchAsync(async(req, res, next) => {
    const rideId = req.body.rideId;
    delete req.body.rideId;
    console.log(req.body);
    const ride = await Ride.updateOne({ _id: rideId, owner: req.user.id }, {
        $set: req.body,
    });
    if (!ride) {
        return next(
            new AppError('You do not have permission to perform this action', 403)
        );
    }
    res.status(200).json({
        status: 'success',
        data: {
            ride,
        },
    });
});

exports.deleteRequestedRide = catchAsync(async(req, res, next) => {
    const user = req.user.id;
    const ride = await Ride.updateOne({ _id: req.body.rideId }, { $pull: { coPassengers: user } });
    if (!ride) {
        return next(
            new AppError('You do not have permission to perform this action', 403)
        );
    }
    res.status(200).json({
        status: 'success',
    });
});

exports.deleteScheduledRide = catchAsync(async(req, res, next) => {
    const ride = await Ride.findOneAndDelete({
        _id: req.body.rideId,
        owner: req.user.id,
    });
    if (!ride) {
        return next(
            new AppError('You do not have permission to perform this action', 403)
        );
    }
    res.status(200).json({
        status: 'success',
    });
});

exports.addCoPassenger = catchAsync(async(req, res, next) => {
    const numCheck = await Ride.findOne({
        _id: req.body.rideId,
    }, { maxNumPassengers: 1, coPassengers: 1 });
    console.log(numCheck);
    if (numCheck.maxNumPassengers <= numCheck.coPassengers.length + 1) {
        return next(new AppError('Ride is already full', 400));
    }
    const user = req.user.id;
    await Ride.updateOne({ _id: req.body.rideId }, { $push: { coPassengers: user } });

    res.status(200).json({
        status: 'success',
    });
});

function calcDist(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
    return (Value * Math.PI) / 180;
}