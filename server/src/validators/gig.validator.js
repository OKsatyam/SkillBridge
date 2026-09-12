import { body } from 'express-validator';

export const createGigValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('packages').custom((value) => {
    const pkgs = typeof value === 'string' ? JSON.parse(value) : value;
    if (!Array.isArray(pkgs) || pkgs.length === 0) throw new Error('At least one package is required');
    return true;
  }),
];