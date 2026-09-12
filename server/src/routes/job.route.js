import { Router } from 'express';
import {
  createJobHandler, listJobsHandler, getJobHandler, updateJobHandler, closeJobHandler,
} from '../controllers/job.controller.js';
import { submitProposalHandler, listProposalsForJobHandler } from '../controllers/proposal.controller.js';
import { protect } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { checkOwnership } from '../middleware/ownership.js';
import { validate } from '../middleware/validate.js';
import { createJobValidator } from '../validators/job.validator.js';
import { submitProposalValidator } from '../validators/proposal.validator.js';
import Job from '../models/Job.js';

const router = Router();

router.get('/', listJobsHandler);   // public
router.get('/:id', getJobHandler);  // public

router.post('/', protect, requirePermission('job:create'), createJobValidator, validate, createJobHandler);
router.put('/:id', protect, requirePermission('job:edit'), checkOwnership(Job, 'client'), updateJobHandler);
router.delete('/:id', protect, requirePermission('job:edit'), checkOwnership(Job, 'client'), closeJobHandler);

router.post(
  '/:id/proposals',
  protect,
  requirePermission('proposal:submit'),
  submitProposalValidator,
  validate,
  submitProposalHandler
);
router.get('/:id/proposals', protect, listProposalsForJobHandler); // ownership checked inside the service

export default router;
