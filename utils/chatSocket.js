const socket = require('socket.io');
const Chat = require('../models/chatModel');

exports.socket = (server) => {
    const io = socket(server, { origins: '*:*', transports: ['websocket'] });
    io.on('connection', (socket) => {
        console.log('user connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
        socket.on('join', (data) => {
            socket.join(data.id); // We are using room of socket io
        });
        socket.on('send_msg', async(data) => {
            const convo = await Chat.findOneAndUpdate({
                $and: [{ participants: data.recieverId }, { participants: data.senderId }],
            }, {
                $push: {
                    messages: {
                        sender: data.senderId,
                        content: data.msg,
                    },
                },
            });
            if (!convo) {
                await Chat.create({
                    participants: [data.recieverId, data.senderId],
                    messages: [{
                        sender: data.senderId,
                        content: data.msg,
                    }, ],
                });
            }

            io.sockets.in(data.recieverId).emit('new_msg', {
                sender: data.senderId,
                senderName: data.senderName,
                content: data.msg,
            });
        });
    });
};