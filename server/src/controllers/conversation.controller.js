import { listMyConversations, getMessages, getConversationForContract } from '../services/conversation.service.js';

export const listMyConversationsHandler = async (req, res, next) => {
  try {
    const conversations = await listMyConversations(req.user._id);
    res.status(200).json({ success: true, data: { conversations }, message: 'Conversations fetched successfully' });
  } catch (err) {
    next(err);
  }
};

export const getMessagesHandler = async (req, res, next) => {
  try {
    const messages = await getMessages(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: { messages }, message: 'Messages fetched successfully' });
  } catch (err) {
    next(err);
  }
};

export const getConversationForContractHandler = async (req, res, next) => {
  try {
    const conversation = await getConversationForContract(req.params.contractId, req.user._id);
    res.status(200).json({ success: true, data: { conversation }, message: 'Conversation fetched successfully' });
  } catch (err) {
    next(err);
  }
};
