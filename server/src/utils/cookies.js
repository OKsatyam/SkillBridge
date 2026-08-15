export const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; 

export const setRefreshTokenCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: REFRESH_COOKIE_MAX_AGE
    });
};

export const clearRefreshTokenCookie = (res) => {
    res.clearCookie('refreshToken')
}