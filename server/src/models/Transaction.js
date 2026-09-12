import mongoose from 'mongoose';

const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    wallet: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true, index: true },
    type: {
      type: String,
      enum: ['deposit', 'escrow_hold', 'escrow_release', 'refund', 'withdrawal'],
      required: true,
    },
    amount: { type: Number, required: true },
    contract: { type: Schema.Types.ObjectId, ref: 'Contract' },
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);
