import { body } from 'express-validator';

export const amountValidator = [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be a positive number'),
];
