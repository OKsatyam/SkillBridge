import passport from 'passport';
import{registerUser,issueTokens} from '../services/auth.service.js';

export const register = async (req, res, next) => {
    try{
        const {name, email, password} = req.body;
        const user = await registerUser({name, email, password});
        const tokens = issueTokens(user);
        res.status(201).json(
            {
                success: true,
                data:{user:{id: user._id, name: user.name, email: user.email, roles: user.roles}, ...tokens},
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
        const tokens = issueTokens(user);
        res.json({success: true, data: {user: {id: user._id, name: user.name, email: user.email, roles: user.roles}, ...tokens}, message: 'Logged in successfully' });
    })(req, res, next);
};

export const me = (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user }, message: 'Current user' });
};