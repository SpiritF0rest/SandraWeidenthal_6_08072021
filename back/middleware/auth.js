const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, "bPeShVmYq3t6w9z$C&F)H@McQfTjWnZr");
        const userId = decodedToken.userId;
        req.auth = { userId };
        if (req.body.userId && req.body.userId !== userId){
            throw "User ID invalid."; 
        } else {
            next();
        }
    } catch (error) {
        res.status(401).json({ error: error | "Unauthenticated request." });
    }
};