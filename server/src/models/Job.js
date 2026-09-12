import mongoose from 'mongoose';

const { Schema } = mongoose;

const jobSchema = new Schema(
  {
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    skills: { type: [String], index: true },
    budgetType: { type: String, enum: ['fixed', 'hourly'], required: true },
    budget: { type: Number, required: true },
    deadline: Date,
    status: { type: String, enum: ['open', 'in-review', 'awarded', 'closed'], default: 'open', index: true },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', skills: 'text' });

export default mongoose.model('Job', jobSchema);