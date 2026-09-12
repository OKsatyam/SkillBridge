import { Router } from 'express';
import { createReviewHandler, listReviewsForUserHandler } from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { createReviewValidator } from '../validators/review.validator.js';

const router = Router();

router.get('/user/:userId', listReviewsForUserHandler);
router.post(
  '/contracts/:contractId',
  protect,
  requirePermission('review:create'),
  createReviewValidator,
  validate,
  createReviewHandler
);

export default router;
