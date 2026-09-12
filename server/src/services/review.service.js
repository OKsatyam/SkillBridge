import Review from '../models/Review.js';
import Contract from '../models/Contract.js';
import User from '../models/User.js';
import Gig from '../models/Gig.js';

const throwErr = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
};

export const createReview = async (contractId, reviewerId, { rating, comment }) => {
  const contract = await Contract.findById(contractId);
  if (!contract) throwErr('Contract not found', 404);
  if (contract.status !== 'completed') throwErr('You can only review a completed contract', 400);

  const isClient = contract.client.toString() === reviewerId.toString();
  const isFreelancer = contract.freelancer.toString() === reviewerId.toString();
  if (!isClient && !isFreelancer) throwErr('Forbidden: not a party to this contract', 403);

  const revieweeId = isClient ? contract.freelancer : contract.client;

  const existing = await Review.findOne({ contract: contractId, reviewer: reviewerId });
  if (existing) throwErr('You have already reviewed this contract', 400);

  const review = await Review.create({
    contract: contractId,
    reviewer: reviewerId,
    reviewee: revieweeId,
    rating,
    comment,
  });

  // Roll the new rating into the reviewee's aggregate User.rating (running average).
  const revieweeUser = await User.findById(revieweeId);
  const newCount = revieweeUser.rating.count + 1;
  const newAvg = (revieweeUser.rating.avg * revieweeUser.rating.count + rating) / newCount;
  revieweeUser.rating = { avg: Number(newAvg.toFixed(2)), count: newCount };
  await revieweeUser.save();

  // If this contract came from a gig owned by the reviewee, roll the rating into the gig too.
  if (contract.source === 'gig' && contract.gig) {
    const gig = await Gig.findById(contract.gig);
    if (gig && gig.owner.toString() === revieweeId.toString()) {
      const gCount = gig.rating.count + 1;
      const gAvg = (gig.rating.avg * gig.rating.count + rating) / gCount;
      gig.rating = { avg: Number(gAvg.toFixed(2)), count: gCount };
      await gig.save();
    }
  }

  return review;
};

export const listReviewsForUser = async (userId) => {
  return Review.find({ reviewee: userId }).populate('reviewer', 'name avatar').sort('-createdAt');
};

export const listReviewsForContract = async (contractId) => {
  return Review.find({ contract: contractId }).populate('reviewer', 'name avatar');
};
