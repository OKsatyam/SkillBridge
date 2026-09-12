import User from '../models/User.js';
import Category from '../models/Category.js';
import Gig from '../models/Gig.js';
import Job from '../models/Job.js';
import Contract from '../models/Contract.js';
import Transaction from '../models/Transaction.js';

const throwErr = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
};

export const listUsers = async () => {
  return User.find().select('-password').sort('-createdAt');
};

export const setUserBanStatus = async (userId, isBanned) => {
  const user = await User.findByIdAndUpdate(userId, { isBanned }, { new: true }).select('-password');
  if (!user) throwErr('User not found', 404);
  return user;
};

export const createCategory = async ({ name }) => {
  return Category.create({ name });
};

export const deleteCategory = async (categoryId) => {
  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) throwErr('Category not found', 404);
  return category;
};

export const getAnalytics = async () => {
  const [userCount, activeGigCount, openJobCount, contractsByStatus, transactionVolumeByType] = await Promise.all([
    User.countDocuments(),
    Gig.countDocuments({ status: 'active' }),
    Job.countDocuments({ status: 'open' }),
    Contract.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Transaction.aggregate([{ $group: { _id: '$type', total: { $sum: '$amount' } } }]),
  ]);

  return { userCount, activeGigCount, openJobCount, contractsByStatus, transactionVolumeByType };
};
