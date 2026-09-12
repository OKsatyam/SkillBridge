import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

export const getOrCreateConversationForContract = async (contract) => {
  let conversation = await Conversation.findOne({ contract: contract._id });
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [contract.client, contract.freelancer],
      contract: contract._id,
    });
  }
  return conversation;
};

export const listMyConversations = async (userId) => {
  return Conversation.find({ participants: userId })
    .populate('participants', 'name avatar')
    .populate('contract', 'status')
    .sort('-lastMessageAt');
};

export const getConversationForContract = async (contractId, userId) => {
  const conversation = await Conversation.findOne({ contract: contractId });
  if (!conversation) {
    const err = new Error('Conversation not found');
    err.statusCode = 404;
    throw err;
  }
  if (!conversation.participants.some((p) => p.toString() === userId.toString())) {
    const err = new Error('Forbidden: not a participant in this conversation');
    err.statusCode = 403;
    throw err;
  }
  return conversation;
};

export const getMessages = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const err = new Error('Conversation not found');
    err.statusCode = 404;
    throw err;
  }
  if (!conversation.participants.some((p) => p.toString() === userId.toString())) {
    const err = new Error('Forbidden: not a participant in this conversation');
    err.statusCode = 403;
    throw err;
  }
  return Message.find({ conversation: conversationId }).populate('sender', 'name avatar').sort('createdAt');
};
