import Category from '../models/Category.js';

export const listCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('name');
    res.status(200).json({ success: true, data: { categories }, message: 'Categories fetched successfully' });
  } catch (err) {
    next(err);
  }
};