import { Router } from 'express';
import {
  listMyConversationsHandler,
  getMessagesHandler,
  getConversationForContractHandler,
} from '../controllers/conversation.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, listMyConversationsHandler);
router.get('/contract/:contractId', protect, getConversationForContractHandler);
router.get('/:id/messages', protect, getMessagesHandler);

export default router;
