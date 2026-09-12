import mongoose from 'mongoose';

const { Schema } = mongoose;

const packageSchema = new Schema(
  {
    tier: { type: String, enum: ['basic', 'standard', 'premium'], required: true },
    price: { type: Number, required: true },
    deliveryDays: { type: Number, required: true },
    revisions: { type: Number, required: true },
    features: [String],
  },
  { _id: false }
);

const gigSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    description: { type: String, required: true },
    images: [String],
    tags: [String],
    packages: {
      type: [packageSchema],
      validate: {
        validator: (pkgs) => pkgs.length > 0,
        message: 'A gig must have at least one package',
      },
    },
    status: { type: String, enum: ['draft', 'active', 'paused', 'archived'], default: 'draft', index: true },
    rating: {
      avg: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

gigSchema.index({ title: 'text', description: 'text', tags: 'text' }); // powers keyword search

export default mongoose.model('Gig', gigSchema);