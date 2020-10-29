const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    console.log('in handleCastError');
    return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
    const value = err.keyValue.name;
    const message = `Duplicate field value: ${value}`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = (err) =>
    new AppError('Invalid token. Please login again!', 401);

const handleJWTExpiredError = (err) =>
    new AppError('Your token has expired. Please login again!', 401);

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    } else {
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message,
        });
    }
};
const sendErrorProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            console.log(err.statusCode);
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        console.error('ERROR');
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong',
        });
    }
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message,
        });
    }
    console.error('ERROR');
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: 'Please try agin later',
    });
};
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = {...err };
        error = err.message;
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateErrorDB(error);
        if (error._message === 'Tour validation failed')
            error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
        if (error.name === 'TokenExpiredError')
            error = handleJWTExpiredError(error);

        sendErrorProd(error, req, res);
    }
};