import { Router } from 'express';
import { getMe, updateMe, getUserById } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateMeValidator } from '../validators/user.validator.js';

const router = Router();

router.get('/me', protect, getMe);
router.patch('/me', protect, updateMeValidator, validate, updateMe);
router.get('/:id', getUserById); // public, no protect

export default router;