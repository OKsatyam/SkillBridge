import {
  listUsers,
  setUserBanStatus,
  createCategory,
  deleteCategory,
  getAnalytics,
} from '../services/admin.service.js';

export const listUsersHandler = async (req, res, next) => {
  try {
    const users = await listUsers();
    res.status(200).json({ success: true, data: { users }, message: 'Users fetched successfully' });
  } catch (err) {
    next(err);
  }
};

export const banUserHandler = async (req, res, next) => {
  try {
    const user = await setUserBanStatus(req.params.id, true);
    res.status(200).json({ success: true, data: { user }, message: 'User banned successfully' });
  } catch (err) {
    next(err);
  }
};

export const unbanUserHandler = async (req, res, next) => {
  try {
    const user = await setUserBanStatus(req.params.id, false);
    res.status(200).json({ success: true, data: { user }, message: 'User unbanned successfully' });
  } catch (err) {
    next(err);
  }
};

export const createCategoryHandler = async (req, res, next) => {
  try {
    const category = await createCategory(req.body);
    res.status(201).json({ success: true, data: { category }, message: 'Category created successfully' });
  } catch (err) {
    next(err);
  }
};

export const deleteCategoryHandler = async (req, res, next) => {
  try {
    await deleteCategory(req.params.id);
    res.status(200).json({ success: true, data: null, message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const getAnalyticsHandler = async (req, res, next) => {
  try {
    const analytics = await getAnalytics();
    res.status(200).json({ success: true, data: { analytics }, message: 'Analytics fetched successfully' });
  } catch (err) {
    next(err);
  }
};
