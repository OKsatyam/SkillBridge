import { Router } from 'express';
import { getWalletHandler, depositHandler, withdrawHandler } from '../controllers/wallet.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { amountValidator } from '../validators/wallet.validator.js';

const router = Router();

router.get('/', protect, getWalletHandler);
router.post('/deposit', protect, amountValidator, validate, depositHandler);
router.post('/withdraw', protect, amountValidator, validate, withdrawHandler);

export default router;
