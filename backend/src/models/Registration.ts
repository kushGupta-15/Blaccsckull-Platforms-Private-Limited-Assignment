import mongoose, { Document, Schema, Model } from 'mongoose';
import { RegistrationStatus, REGISTRATION_STATUS } from '../utils/constants';

// ── Interface ─────────────────────────────────────────────────────────────────
export interface IRegistrationDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  competitionId: mongoose.Types.ObjectId;
  registeredAt: Date;
  status: RegistrationStatus;
}

export interface IRegistrationModel extends Model<IRegistrationDocument> {}

// ── Schema ────────────────────────────────────────────────────────────────────
const registrationSchema = new Schema<IRegistrationDocument, IRegistrationModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: 'Competition',
      required: [true, 'Competition is required'],
    },
    registeredAt: {
      type: Date,
      default: () => new Date(),
    },
    status: {
      type: String,
      enum: Object.values(REGISTRATION_STATUS),
      default: REGISTRATION_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Compound unique index — last-line-of-defense against duplicate registrations
// even under concurrent load (the unique constraint is enforced at the DB level)
registrationSchema.index(
  { userId: 1, competitionId: 1 },
  { unique: true }
);
registrationSchema.index({ competitionId: 1, status: 1 });
registrationSchema.index({ userId: 1, status: 1 });

// ── Model ─────────────────────────────────────────────────────────────────────
const Registration = mongoose.model<IRegistrationDocument, IRegistrationModel>(
  'Registration',
  registrationSchema
);

export default Registration;
