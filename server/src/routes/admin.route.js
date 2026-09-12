import { Router } from 'express';
import {
  listUsersHandler,
  banUserHandler,
  unbanUserHandler,
  createCategoryHandler,
  deleteCategoryHandler,
  getAnalyticsHandler,
} from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.use(protect, requireRole('admin'));

router.get('/users', listUsersHandler);
router.patch('/users/:id/ban', banUserHandler);
router.patch('/users/:id/unban', unbanUserHandler);
router.post('/categories', createCategoryHandler);
router.delete('/categories/:id', deleteCategoryHandler);
router.get('/analytics', getAnalyticsHandler);

export default router;
