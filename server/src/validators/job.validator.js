import { body } from 'express-validator';

export const createJobValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('budgetType').isIn(['fixed', 'hourly']).withMessage('Budget type must be fixed or hourly'),
  body('budget').isFloat({ min: 1 }).withMessage('Budget must be a positive number'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
];