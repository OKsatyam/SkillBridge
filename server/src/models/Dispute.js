import mongoose from 'mongoose';

const { Schema } = mongoose;

const disputeSchema = new Schema(
  {
    contract: { type: Schema.Types.ObjectId, ref: 'Contract', required: true, index: true },
    milestone: { type: Schema.Types.ObjectId, required: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['open', 'resolved'], default: 'open', index: true },
    resolution: String,
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Dispute', disputeSchema);
