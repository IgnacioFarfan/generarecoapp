import jwt from "jsonwebtoken";

export const userPassJwt = () => {
    return async (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];
        if (token !== undefined) {
            const user = jwt.verify(token, process.env.USERCOOKIESECRET);
            req.user = user;
        } else {
            req.user = null;
        }
        next();
    }
}