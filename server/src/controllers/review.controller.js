import { createReview, listReviewsForUser } from '../services/review.service.js';

export const createReviewHandler = async (req, res, next) => {
  try {
    const review = await createReview(req.params.contractId, req.user._id, req.body);
    res.status(201).json({ success: true, data: { review }, message: 'Review submitted successfully' });
  } catch (err) {
    next(err);
  }
};

export const listReviewsForUserHandler = async (req, res, next) => {
  try {
    const reviews = await listReviewsForUser(req.params.userId);
    res.status(200).json({ success: true, data: { reviews }, message: 'Reviews fetched successfully' });
  } catch (err) {
    next(err);
  }
};
