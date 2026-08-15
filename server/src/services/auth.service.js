import User from '../models/User.js';
import {generateAccessToken, generateRefreshToken} from '../utils/token.js';
import jwt from 'jsonwebtoken';

export const registerUser = async ({name, email, password}) => {
    const existing = await User.findOne({email});
    if(existing){
        const err = new  Error('User already exists');
        err.statusCode = 409;
        throw err;
    }
    const user = await User.create({name, email, password});
    return user;
}

export const issueTokens = (user)=>({
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
})


export const rotateTokens = async (refreshToken) => {
    let decoded;
    try{
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    }
    catch(err){
        const error = new Error('Invalid OR expired refresh token');
        error.statusCode = 401;
        throw error;
    }

    const user = await User.findById(decoded.id);
    if(!user|| user.refreshTokenVersion !== decoded.tokenVersion){
        const error = new Error('Refresh token has been invalidated');
        error.statusCode = 401;
        throw error;
    }

    return {accessToken: generateAccessToken(user), refreshToken: generateRefreshToken(user)}
};

export const logoutUser = async (user) => {
    user.refreshTokenVersion += 1;
    await user.save();
}