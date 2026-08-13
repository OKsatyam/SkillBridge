import User from '../models/User.js';
import {generateAccessToken, generateRefreshToken} from '../utils/token.js';

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