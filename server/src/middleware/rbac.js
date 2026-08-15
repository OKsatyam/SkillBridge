import {ROLE_PERMISSIONS} from '../config/permissions.js';

export const requireRole = (...allowedRoles)=> (req, res, next) => {
    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
    if(!hasRole){
        return res.status(403).json({
            success: false,
            data: null,
            message: 'Forbidden: You do not have the required role to access this resource'
        })
    }
    next();
}

export const requirePermission = (...allowedPermissions) => (req, res, next) => {
    const userPermissions = req.user.roles.flatMap(role => ROLE_PERMISSIONS[role] || []);
    const hasAll = allowedPermissions.every(permission => userPermissions.includes(permission));
    if(!hasAll){
        return res.status(403).json({
            success: false, 
            data: null,
            message: 'Forbidden: You do not have the required permissions to access this resource'
        })
    }
    next();
}

