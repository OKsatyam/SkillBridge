import { body } from 'express-validator';

export const updateMeValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be under 500 characters'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('languages').optional().isArray().withMessage('Languages must be an array'),
  body('hourlyRate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  body('roles').optional().isArray().withMessage('Roles must be an array')
    .custom((roles) => roles.every((r) => ['client', 'freelancer'].includes(r)))
    .withMessage('Roles can only be client or freelancer'),
];