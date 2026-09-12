import mongoose from 'mongoose';

const { Schema } = mongoose;

const conversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    contract: { type: Schema.Types.ObjectId, ref: 'Contract', index: true },
    lastMessage: { type: String, default: '' },
    lastMessageAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Conversation', conversationSchema);
