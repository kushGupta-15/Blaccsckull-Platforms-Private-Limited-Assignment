import mongoose from 'mongoose';
import Submission, { ISubmissionDocument } from '../models/Submission';
import Competition from '../models/Competition';
import Registration from '../models/Registration';
import { createError } from '../middleware/errorHandler';
import { REGISTRATION_STATUS, SUBMISSION_STATUS } from '../utils/constants';

// ── Submit Project (T10.2) ───────────────────────────────────────────────────
export const createOrUpdateSubmission = async (
  competitionId: string,
  userId: string,
  data: {
    title: string;
    description: string;
    repositoryUrl: string;
    demoUrl?: string;
    mediaUrl?: string;
  }
): Promise<ISubmissionDocument> => {
  if (!mongoose.Types.ObjectId.isValid(competitionId)) {
    throw createError('Invalid competition ID', 400);
  }

  const competition = await Competition.findById(competitionId);
  if (!competition) {
    throw createError('Competition not found', 404);
  }

  // Check if competition deadline has passed
  if (new Date() > competition.endDate) {
    throw createError('Submissions are closed as this competition has ended', 400);
  }

  // Verify that the user has an active registration
  const registration = await Registration.findOne({
    competitionId,
    userId,
    status: REGISTRATION_STATUS.ACTIVE,
  });

  if (!registration) {
    throw createError('You must be registered for this competition to submit a project', 403);
  }

  // Upsert: check if submission already exists for this participant
  let submission = await Submission.findOne({ competitionId, userId });

  if (submission) {
    submission.title = data.title.trim();
    submission.description = data.description.trim();
    submission.repositoryUrl = data.repositoryUrl.trim();
    submission.demoUrl = data.demoUrl?.trim() || undefined;
    submission.mediaUrl = data.mediaUrl?.trim() || undefined;
    submission.status = SUBMISSION_STATUS.SUBMITTED;
    await submission.save();
  } else {
    submission = await Submission.create({
      competitionId,
      userId,
      title: data.title.trim(),
      description: data.description.trim(),
      repositoryUrl: data.repositoryUrl.trim(),
      demoUrl: data.demoUrl?.trim() || undefined,
      mediaUrl: data.mediaUrl?.trim() || undefined,
      status: SUBMISSION_STATUS.SUBMITTED,
    });
  }

  await submission.populate('userId', 'name email avatar');
  return submission;
};

// ── List Submissions for Competition (T10.3) ─────────────────────────────────
export const getCompetitionSubmissions = async (
  competitionId: string,
  currentUserId?: string
): Promise<{ items: object[]; total: number }> => {
  if (!mongoose.Types.ObjectId.isValid(competitionId)) {
    throw createError('Invalid competition ID', 400);
  }

  const submissions = await Submission.find({ competitionId })
    .populate('userId', 'name email avatar')
    .sort({ isWinner: -1, awardRank: 1, upvoteCount: -1, createdAt: -1 });

  const items = submissions.map((doc) => {
    const json = doc.toJSON() as Record<string, unknown>;
    const hasUpvoted = currentUserId
      ? doc.upvotes.some((id) => id.toString() === currentUserId)
      : false;
    delete json.upvotes; // Omit list of user IDs for cleanliness and privacy
    return {
      ...json,
      hasUpvoted,
    };
  });

  return {
    items,
    total: items.length,
  };
};

// ── Get Current User's Submission (T10.3) ─────────────────────────────────────
export const getMySubmission = async (
  competitionId: string,
  userId: string
): Promise<object | null> => {
  if (!mongoose.Types.ObjectId.isValid(competitionId)) {
    throw createError('Invalid competition ID', 400);
  }

  const submission = await Submission.findOne({ competitionId, userId }).populate(
    'userId',
    'name email avatar'
  );

  if (!submission) {
    return null;
  }

  const json = submission.toJSON() as Record<string, unknown>;
  const hasUpvoted = submission.upvotes.some((id) => id.toString() === userId);
  delete json.upvotes;

  return {
    ...json,
    hasUpvoted,
  };
};

// ── Toggle Upvote (T10.4) ─────────────────────────────────────────────────────
export const toggleUpvoteSubmission = async (
  submissionId: string,
  userId: string
): Promise<{ hasUpvoted: boolean; upvoteCount: number }> => {
  if (!mongoose.Types.ObjectId.isValid(submissionId)) {
    throw createError('Invalid submission ID', 400);
  }

  const submission = await Submission.findById(submissionId);
  if (!submission) {
    throw createError('Submission not found', 404);
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const alreadyUpvoted = submission.upvotes.some((id) => id.toString() === userId);

  if (alreadyUpvoted) {
    const updated = await Submission.findByIdAndUpdate(
      submissionId,
      {
        $pull: { upvotes: userObjectId },
        $inc: { upvoteCount: -1 },
      },
      { new: true }
    );
    return {
      hasUpvoted: false,
      upvoteCount: Math.max(0, updated?.upvoteCount ?? 0),
    };
  } else {
    const updated = await Submission.findByIdAndUpdate(
      submissionId,
      {
        $addToSet: { upvotes: userObjectId },
        $inc: { upvoteCount: 1 },
      },
      { new: true }
    );
    return {
      hasUpvoted: true,
      upvoteCount: updated?.upvoteCount ?? 1,
    };
  }
};

// ── Host: Evaluate Submission (T10.5) ─────────────────────────────────────────
export const evaluateSubmission = async (
  submissionId: string,
  hostId: string,
  data: {
    score?: number;
    feedback?: string;
    awardRank?: 1 | 2 | 3;
    isWinner?: boolean;
  }
): Promise<ISubmissionDocument> => {
  if (!mongoose.Types.ObjectId.isValid(submissionId)) {
    throw createError('Invalid submission ID', 400);
  }

  const submission = await Submission.findById(submissionId);

  if (!submission) {
    throw createError('Submission not found', 404);
  }

  const competition = await Competition.findById(submission.competitionId);
  if (!competition) {
    throw createError('Associated competition not found', 404);
  }

  if (competition.hostId.toString() !== hostId) {
    throw createError('Only the competition organizer can evaluate submissions', 403);
  }

  if (typeof data.score === 'number') {
    submission.score = Math.min(100, Math.max(0, data.score));
  }
  if (typeof data.feedback === 'string') {
    submission.feedback = data.feedback.trim();
  }
  if (data.awardRank !== undefined) {
    submission.awardRank = data.awardRank;
    submission.isWinner = true;
  } else if (data.isWinner !== undefined) {
    submission.isWinner = data.isWinner;
  }

  submission.status = SUBMISSION_STATUS.EVALUATED;
  await submission.save();
  await submission.populate('userId', 'name email avatar');

  return submission;
};

// ── Host: Finalize Winners (T10.5 & T11.1) ────────────────────────────────────
export const finalizeWinners = async (
  competitionId: string,
  hostId: string,
  winners: Array<{ submissionId: string; rank: 1 | 2 | 3 }>
): Promise<ISubmissionDocument[]> => {
  if (!mongoose.Types.ObjectId.isValid(competitionId)) {
    throw createError('Invalid competition ID', 400);
  }

  const competition = await Competition.findById(competitionId);
  if (!competition) {
    throw createError('Competition not found', 404);
  }

  if (competition.hostId.toString() !== hostId) {
    throw createError('Only the competition organizer can finalize winners', 403);
  }

  // Clear existing winners first
  await Submission.updateMany(
    { competitionId },
    { $set: { isWinner: false, awardRank: undefined } }
  );

  // Set the specified winners
  for (const item of winners) {
    if (mongoose.Types.ObjectId.isValid(item.submissionId)) {
      await Submission.findByIdAndUpdate(item.submissionId, {
        isWinner: true,
        awardRank: item.rank,
        status: SUBMISSION_STATUS.EVALUATED,
      });
    }
  }

  // Return the winners populated with author profiles
  return Submission.find({ competitionId, isWinner: true })
    .sort({ awardRank: 1 })
    .populate('userId', 'name email avatar');
};

// ── Get Winners Showcase (T11.1) ──────────────────────────────────────────────
export const getCompetitionWinners = async (
  competitionId: string
): Promise<ISubmissionDocument[]> => {
  if (!mongoose.Types.ObjectId.isValid(competitionId)) {
    throw createError('Invalid competition ID', 400);
  }

  return Submission.find({ competitionId, isWinner: true })
    .sort({ awardRank: 1 })
    .populate('userId', 'name email avatar');
};
