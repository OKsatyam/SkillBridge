import { body } from 'express-validator';

export const createContractValidator = [
  body('source').isIn(['gig', 'job']).withMessage('Source must be "gig" or "job"'),
];
