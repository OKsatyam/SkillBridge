import { Router } from 'express';
import {
  raiseDisputeHandler,
  listOpenDisputesHandler,
  resolveDisputeHandler,
} from '../controllers/dispute.controller.js';
import { protect } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { raiseDisputeValidator, resolveDisputeValidator } from '../validators/dispute.validator.js';

const router = Router();

router.post(
  '/contracts/:contractId/milestones/:milestoneId',
  protect,
  requirePermission('dispute:raise'),
  raiseDisputeValidator,
  validate,
  raiseDisputeHandler
);
router.get('/', protect, requirePermission('dispute:resolve'), listOpenDisputesHandler);
router.patch(
  '/:id/resolve',
  protect,
  requirePermission('dispute:resolve'),
  resolveDisputeValidator,
  validate,
  resolveDisputeHandler
);

export default router;
