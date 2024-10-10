const sendToken = (user, statusCode, res) => {
    const token = user.getJWTToken();

    // Cookie options
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000), // expiration time
        httpOnly: true,   // prevent JS from accessing the cookie
        // secure: process.env.NODE_ENV === 'production', // true in production, false in development (http)
        // sameSite: 'None', // Required for cross-origin cookies (Lax/Strict if not cross-origin)
        // path: '/',        // Make the cookie accessible to the entire app
    };

    // Set cookie with token in response
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        token,
    });
};

module.exports = sendToken;
