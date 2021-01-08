const HttpError = require("./HttpError");

module.exports = class BadRequestError extends HttpError{

    constructor(message){
        super(400, message);
    }

}