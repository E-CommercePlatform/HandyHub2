// catchAsync is a utility function that wraps async route handlers.
// It automatically catches any errors and passes them to Express's error-handling middleware using next(err).
// This removes the need for try-catch blocks in every async route.
module.exports = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next); // If fn throws an error, it's caught and sent to next() for error handling
    };
};

