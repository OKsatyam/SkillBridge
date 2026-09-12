import mongoose from 'mongoose';

const { Schema } = mongoose;

const milestoneSchema = new Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: Date,
  deliverables: [String],
  status: {
    type: String,
    enum: ['pending', 'funded', 'in-progress', 'submitted', 'approved', 'revision'],
    default: 'pending',
  },
});

const contractSchema = new Schema(
  {
    source: { type: String, enum: ['gig', 'job'], required: true },
    gig: { type: Schema.Types.ObjectId, ref: 'Gig' },
    job: { type: Schema.Types.ObjectId, ref: 'Job' },
    proposal: { type: Schema.Types.ObjectId, ref: 'Proposal' },
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    freelancer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    milestones: [milestoneSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'disputed'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Contract', contractSchema);
