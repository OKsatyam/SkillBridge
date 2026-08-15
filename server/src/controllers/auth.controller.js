import passport from 'passport';
import{registerUser,issueTokens,rotateTokens,logoutUser} from '../services/auth.service.js';
import {setRefreshTokenCookie, clearRefreshTokenCookie} from '../utils/cookies.js';

export const register = async (req, res, next) => {
    try{
        const {name, email, password} = req.body;
        const user = await registerUser({name, email, password});
        const {accessToken, refreshToken} = issueTokens(user);
        setRefreshTokenCookie(res, refreshToken);
        res.status(201).json(
            {
                success: true,
                data:{user:{id: user._id, name: user.name, email: user.email, roles: user.roles}, accessToken},
                message: 'User registered successfully'
            }
        );
    }
    catch(err){
        next(err);
    }
}

export const login = (req, res, next) => {
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({success: false, message: info?.message || 'Invalid credentials'});
        }
        const {accessToken, refreshToken} = issueTokens(user);
        setRefreshTokenCookie(res, refreshToken);
        res.json({success: true, data: {user: {id: user._id, name: user.name, email: user.email, roles: user.roles}, accessToken}, message: 'Logged in successfully' });
    })(req, res, next);
};

export const me = (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user }, message: 'Current user' });
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, data: null, message: 'No refresh token provided' });
    }
    const { accessToken, refreshToken } = await rotateTokens(token);
    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({ success: true, data: { accessToken }, message: 'Token refreshed' });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await logoutUser(req.user);
    clearRefreshTokenCookie(res);
    res.status(200).json({ success: true, data: null, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};