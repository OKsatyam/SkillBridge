import { Router } from 'express';
import { listNotificationsHandler, markReadHandler } from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, listNotificationsHandler);
router.patch('/:id/read', protect, markReadHandler);

export default router;
