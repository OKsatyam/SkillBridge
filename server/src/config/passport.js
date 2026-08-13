import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js';

// local -startegy used for auth/login
passport.use(
    new LocalStrategy(
        {usernameField: 'email'},
        async (email, password, done) => {
            try{
                const user = await User.findOne({email}).select('+password');
                if(!user){
                    return done(null, false, {message: 'Invalid credentials'});
                }
                const isMatch = await user.comparePassword(password);
                if(!isMatch){
                    return done(null, false, {message: 'Password is incorrect'});
                }
                if(user.isBanned){
                    return done(null, false, {message: 'Account is banned'});
                }
                return done(null, user);
            }
            catch(err){
                return done(err);
            }
        }

    )
);

// jwt strategy used for auth/verify
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_ACCESS_SECRET
        },
        async (payload, done) => {
            try{
                const user = await User.findById(payload.id);
                if(!user){return done(null, false, {message: 'User not found'});}
                if(user.isBanned){return done(null, false, {message: 'Account is banned'});}
                return done(null, user);
            }
            catch(err){
                return done(err, false);
            }
        }
    )
)

export default passport;