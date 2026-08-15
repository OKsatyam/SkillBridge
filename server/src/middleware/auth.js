import passport from 'passport';
export const protect = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                success: false,
                data: null,
                message: info ?.message || 'Unauthorized' 
            });
        }
        req.user = user;
        next();
    })(req, res, next);
};