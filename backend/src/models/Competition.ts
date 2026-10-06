import mongoose, { Document, Schema, Model } from 'mongoose';
import { CompetitionStatus, COMPETITION_STATUS } from '../utils/constants';

// ── Interface ─────────────────────────────────────────────────────────────────
export interface ICompetitionDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  bannerImage?: string;
  category: string;
  startDate: Date;
  endDate: Date;
  totalSpots: number;
  registeredCount: number;
  entryFee: number;
  prizePool: string;
  rules: string[];
  hostId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // Virtual — computed at read time from dates + registeredCount
  readonly computedStatus: CompetitionStatus;
}

export interface ICompetitionModel extends Model<ICompetitionDocument> {}

// ── Schema ────────────────────────────────────────────────────────────────────
const competitionSchema = new Schema<ICompetitionDocument, ICompetitionModel>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    bannerImage: {
      type: String,
      default: undefined,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    totalSpots: {
      type: Number,
      required: [true, 'Total spots is required'],
      min: [1, 'Must have at least 1 spot'],
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: [0, 'Registered count cannot be negative'],
    },
    entryFee: {
      type: Number,
      default: 0,
      min: [0, 'Entry fee cannot be negative'],
    },
    prizePool: {
      type: String,
      default: 'No prize',
      trim: true,
    },
    rules: {
      type: [String],
      default: [],
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.__v;
        delete ret.id; // suppress duplicate of _id added by virtuals:true
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ── Computed Status Virtual ───────────────────────────────────────────────────
// Status is derived from dates and capacity — never stale in the DB.
competitionSchema.virtual('computedStatus').get(function (
  this: ICompetitionDocument
): CompetitionStatus {
  const now = new Date();
  if (now < this.startDate) return COMPETITION_STATUS.UPCOMING;
  if (now > this.endDate) return COMPETITION_STATUS.ENDED;
  if (this.registeredCount >= this.totalSpots) return COMPETITION_STATUS.FULL;
  return COMPETITION_STATUS.ACTIVE;
});

// ── Indexes ───────────────────────────────────────────────────────────────────
competitionSchema.index({ startDate: 1 });
competitionSchema.index({ endDate: 1 });
competitionSchema.index({ hostId: 1 });
competitionSchema.index({ category: 1 });
// Text index for title search
competitionSchema.index({ title: 'text', description: 'text' });

// ── Validation: endDate must be after startDate ───────────────────────────────
competitionSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  } else {
    next();
  }
});

// ── Model ─────────────────────────────────────────────────────────────────────
const Competition = mongoose.model<ICompetitionDocument, ICompetitionModel>(
  'Competition',
  competitionSchema
);

export default Competition;
