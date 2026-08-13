import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    roles: {
      type: [String],
      enum: ['client', 'freelancer', 'admin'],
      default: ['client'],
    },
    refreshTokenVersion: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    skills: {
      type: [String],
      default: [],
    },
    hourlyRate: {
      type: Number,
      default: null,
    },
    portfolio: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
    rating: {
      avg: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      default: null,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving — only if it was changed
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Instance method to compare plain-text password against stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;