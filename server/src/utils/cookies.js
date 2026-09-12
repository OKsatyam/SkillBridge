export const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const isProd = () => process.env.NODE_ENV === 'production';

// sameSite: 'strict' only works when the frontend and API are on the same site (e.g. both on
// localhost during dev — different ports still count as "same site"). Once they're deployed on
// two different domains (e.g. a Vercel frontend + a Render backend), a 'strict' cookie is never
// sent on cross-site requests at all, silently breaking /auth/refresh. 'none' is required for
// cross-site cookies to work, and browsers require 'secure: true' whenever sameSite is 'none' —
// which is fine here since a production deployment is always served over HTTPS.
const cookieOptions = () => ({
    httpOnly: true,
    secure: isProd(),
    sameSite: isProd() ? 'none' : 'strict',
});

export const setRefreshTokenCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        ...cookieOptions(),
        maxAge: REFRESH_COOKIE_MAX_AGE
    });
};

export const clearRefreshTokenCookie = (res) => {
    res.clearCookie('refreshToken', cookieOptions())
}