import mongoose from 'mongoose';

const { Schema } = mongoose;

const walletSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    available: { type: Number, default: 0 }, // spendable / withdrawable
    escrow: { type: Number, default: 0 },    // held against funded milestones
  },
  { timestamps: true }
);

export default mongoose.model('Wallet', walletSchema);
