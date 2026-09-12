import mongoose from 'mongoose';

const { Schema } = mongoose;

const proposalSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    freelancer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    coverLetter: { type: String, required: true },
    bidAmount: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    status: {
      type: String,
      enum: ['submitted', 'shortlisted', 'rejected', 'accepted'],
      default: 'submitted',
      index: true,
    },
  },
  { timestamps: true }
);

proposalSchema.index({ job: 1, freelancer: 1 }, { unique: true }); // one proposal per freelancer per job

export default mongoose.model('Proposal', proposalSchema);
