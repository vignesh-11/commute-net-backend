const mongoose = require('mongoose');
const validator = require('validator');

const rideSchema = new mongoose.Schema({
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
    },
    endLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Ride must belong to a user'],
    },
    transportMode: {
        type: String,
        enum: ['4-wheeler', '2-wheeler', 'cab', 'auto-rikshaw'],
        required: [true, 'Please enter mode of transportation'],
    },
    numPassengers: Number,
    coPassengers: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    route: {
        type: {
            type: String,
            default: 'LineString',
            enum: ['LineString'],
        },
        coordinates: Array
    }
})

rideSchema.index({ startLocation: "2dsphere" });
rideSchema.index({ endLocation: "2dsphere" });
rideSchema.index({ route: "2dsphere" });

rideSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'owner',
        select: '-__v -role -email',
    }).populate({
        path: 'coPassengers',
        select: '-__v -role -email'
    });
    next();
});

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;