import mongoose, { Document, Schema, Model } from 'mongoose';
import { SubmissionStatus, SUBMISSION_STATUS } from '../utils/constants';

// ── Interface ─────────────────────────────────────────────────────────────────
export interface ISubmissionDocument extends Document {
  _id: mongoose.Types.ObjectId;
  competitionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  repositoryUrl: string;
  demoUrl?: string;
  mediaUrl?: string;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  isWinner: boolean;
  awardRank?: 1 | 2 | 3;
  upvotes: mongoose.Types.ObjectId[];
  upvoteCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubmissionModel extends Model<ISubmissionDocument> {}

// ── Schema ────────────────────────────────────────────────────────────────────
const submissionSchema = new Schema<ISubmissionDocument, ISubmissionModel>(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: 'Competition',
      required: [true, 'Competition is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [3, 'Project title must be at least 3 characters'],
      maxlength: [120, 'Project title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    repositoryUrl: {
      type: String,
      required: [true, 'Repository URL is required'],
      trim: true,
      match: [/^https?:\/\/.+/, 'Please provide a valid repository URL'],
    },
    demoUrl: {
      type: String,
      trim: true,
      default: undefined,
    },
    mediaUrl: {
      type: String,
      trim: true,
      default: undefined,
    },
    status: {
      type: String,
      enum: Object.values(SUBMISSION_STATUS),
      default: SUBMISSION_STATUS.SUBMITTED,
    },
    score: {
      type: Number,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
      default: undefined,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [2000, 'Feedback cannot exceed 2000 characters'],
      default: undefined,
    },
    isWinner: {
      type: Boolean,
      default: false,
    },
    awardRank: {
      type: Number,
      enum: [1, 2, 3],
      default: undefined,
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    upvoteCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret): Record<string, unknown> {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Strict uniqueness: one submission per participant per competition
submissionSchema.index({ competitionId: 1, userId: 1 }, { unique: true });
submissionSchema.index({ competitionId: 1, upvoteCount: -1 });
submissionSchema.index({ competitionId: 1, isWinner: 1, awardRank: 1 });
submissionSchema.index({ userId: 1 });

const Submission = mongoose.model<ISubmissionDocument, ISubmissionModel>(
  'Submission',
  submissionSchema
);

export default Submission;
