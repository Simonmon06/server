import expressJwt from 'express-jwt'


// if the info is valid, 
export const requireSignin = expressJwt({
    // secret, expire date
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
})