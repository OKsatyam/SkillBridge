import { Router } from 'express';
import {
  createContractHandler,
  getContractHandler,
  listMyContractsHandler,
  submitMilestoneHandler,
} from '../controllers/contract.controller.js';
import { fundMilestoneHandler, approveMilestoneHandler } from '../controllers/wallet.controller.js';
import { protect } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { createContractValidator } from '../validators/contract.validator.js';

const router = Router();

router.get('/', protect, listMyContractsHandler);
router.get('/:id', protect, getContractHandler);
router.post('/', protect, requirePermission('contract:create'), createContractValidator, validate, createContractHandler);
router.post('/:id/milestones/:mId/submit', protect, requirePermission('milestone:submit'), submitMilestoneHandler);
router.post('/:id/milestones/:mId/fund', protect, requirePermission('contract:fund'), fundMilestoneHandler);
router.post('/:id/milestones/:mId/approve', protect, requirePermission('contract:approve'), approveMilestoneHandler);

export default router;
