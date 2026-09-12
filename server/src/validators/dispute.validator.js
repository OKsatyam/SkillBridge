import { body } from 'express-validator';

export const raiseDisputeValidator = [
  body('reason').trim().notEmpty().withMessage('A reason is required to raise a dispute'),
];

export const resolveDisputeValidator = [
  body('outcome')
    .isIn(['refund_client', 'release_freelancer'])
    .withMessage('Outcome must be "refund_client" or "release_freelancer"'),
  body('resolution').optional().isString(),
];
