import { body } from 'express-validator';

export const submitProposalValidator = [
  body('coverLetter').trim().notEmpty().withMessage('Cover letter is required'),
  body('bidAmount').isFloat({ min: 1 }).withMessage('Bid amount must be a positive number'),
  body('durationDays').isInt({ min: 1 }).withMessage('Duration must be at least 1 day'),
];

export const updateProposalStatusValidator = [
  body('status').isIn(['shortlisted', 'rejected', 'accepted']).withMessage('Invalid status'),
];
