import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// ── Interface ─────────────────────────────────────────────────────────────────
export interface IUserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  // Instance method
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDocument> {
  // Static methods can be added here if needed
}

// ── Schema ────────────────────────────────────────────────────────────────────
const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Never returned in queries by default
    },
    avatar: {
      type: String,
      default: undefined,
    },
  },
  {
    timestamps: true,
    // When converting to JSON/Object, strip passwordHash
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });

// ── Instance Methods ──────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash as string);
};

// ── Model ─────────────────────────────────────────────────────────────────────
const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default User;
