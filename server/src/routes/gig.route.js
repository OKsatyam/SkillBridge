import { Router } from 'express';
import {
  createGigHandler, listGigsHandler, getGigHandler, updateGigHandler, archiveGigHandler,
} from '../controllers/gig.controller.js';
import { protect } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { checkOwnership } from '../middleware/ownership.js';
import { validate } from '../middleware/validate.js';
import { createGigValidator } from '../validators/gig.validator.js';
import { uploadGigImages } from '../config/multer.js';
import Gig from '../models/Gig.js';

const router = Router();

router.get('/', listGigsHandler);   // public
router.get('/:id', getGigHandler);  // public

router.post(
  '/',
  protect,
  requirePermission('gig:create'),
  uploadGigImages.array('images', 5),
  createGigValidator,
  validate,
  createGigHandler
);

router.put(
  '/:id',
  protect,
  requirePermission('gig:edit'),
  checkOwnership(Gig),
  uploadGigImages.array('images', 5),
  updateGigHandler
);

router.delete(
  '/:id',
  protect,
  requirePermission('gig:edit'),
  checkOwnership(Gig),
  archiveGigHandler
);

export default router;