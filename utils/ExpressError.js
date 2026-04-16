class ExpressError extends Error { // extends express error class 
    constructor(statusCode, message) {
        super(); //Calls the constructor of the parent Error class, so we get all the default error-handling behavior.
        this.statusCode = statusCode;
        this.message = message;
    }
}

module.exports = ExpressError;


