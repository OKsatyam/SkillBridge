import {Router} from 'express';
import {register,login,me,refresh,logout} from '../controllers/auth.controller.js';
import {protect} from '../middleware/auth.js';



const router = Router();

router.post('/register', register);
router.post('/login', login);



router.post('/refresh', refresh);
router.post('/logout', protect, logout);

export default router;