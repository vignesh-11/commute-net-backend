const mongoose = require('mongoose');
const dotnev = require('dotenv');
const app = require('./app');

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception! Server shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

dotnev.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('DB connection successful');
    });

const port = 3000;
const server = app.listen(port, () => {
    console.log(`listening on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
    console.log('Unhandled rejection! Server shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
    process.exit(1);
});