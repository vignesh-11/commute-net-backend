const Chat = require('../models/chatModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.fetchChats = catchAsync(async(req, res, next) => {
    const convos = await Chat.find({ participants: req.user.id });
    res.status(200).json({
        status: 'success',
        data: {
            convos,
        },
    });
});