/*
CREATED BY

NAME: BISWARUP BHATTACHARJEE
PH NO.: 6290272740
EMAIL: bbiswa471@gmail.com
*/
function errorHandler(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        // jwt authentication error
        return res.status(401).json({message: "The user is not authorized for Freedom Gaming"})
    }

    if (err.name === 'ValidationError') {
        //  validation error
        return res.status(401).json({message: err})
    }

    // default to 500 server error
    return res.status(500).json(err);
}

module.exports = errorHandler;
