import { Router } from 'express';
import { updateProposalStatusHandler } from '../controllers/proposal.controller.js';
import { protect } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { updateProposalStatusValidator } from '../validators/proposal.validator.js';

const router = Router();

router.patch(
  '/:id',
  protect,
  requirePermission('proposal:manage'),
  updateProposalStatusValidator,
  validate,
  updateProposalStatusHandler
);

export default router;
