const mongoose = require('mongoose');
// const validator = require('validator');

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }, ],
    messages: [{
        sender: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
        content: String,
        timeStamp: {
            type: Date,
            default: Date.now(),
        },
    }, ],
});

chatSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'participants',
        select: '-__v -role',
    });
    next();
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;