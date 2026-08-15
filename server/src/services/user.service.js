import User from "../models/User.js";

const ALLOWED_FIELDS = ['name', 'bio', 'skills', 'hourlyRate', 'languages', 'avatar', 'portfolio'];

export const  updateProfile = async (userId, updates) => {
    const safeUpdates = {};
    for(const field of ALLOWED_FIELDS){
        if(updates[field] !== undefined) safeUpdates[field] = updates[field];
    }

    if(updates.roles){
        const user = await User.findById(userId);
        safeUpdates.roles = Array.from(new Set([...user.roles, ...updates.roles]));
    }

    const updatedUser = await User.findByIdAndUpdate(userId, safeUpdates, {new: true, runValidators: true});
    return updatedUser;
};
export const getPublicProfile = async (userId) => {
  const user = await User.findById(userId).select('name avatar bio skills hourlyRate languages rating createdAt');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};
