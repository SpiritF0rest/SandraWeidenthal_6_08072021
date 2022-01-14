const jwt       = require("jsonwebtoken");
const dotenv    = require('dotenv').config();

//Checks the validity of the id of the user making the request.
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.DB_KEY);//decode the token
        const userId = decodedToken.userId;
        req.auth = { userId };
        if (req.body.userId && req.body.userId !== userId) {
            throw "User ID invalid.";
        } else {
            next();
        }
    } catch (error) {
        res.status(401).json({ error: error | "Unauthenticated request." });
    }
};