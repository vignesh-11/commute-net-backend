const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
//const hpp = require('hpp');
const cors = require('cors')
const cookieParser = require('cookie-parser');

//Route imports
const userRouter = require('./routes/userRoutes');
const rideRouter = require('./routes/rideRoutes')

//custom utility module imports
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('dev'));

app.use(helmet());

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour',
});

app.use('/api', limiter);

app.use(express.json('10kb'));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use(cors())

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next();
});

//routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/rides', rideRouter);

app.all('*', (req, res, next) => {
    // const err = new Error(`Can't find ${req.originalUrl} on this server`);
    // err.status = 'fail';
    // err.statusCode = 404;

    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;