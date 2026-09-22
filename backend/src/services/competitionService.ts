import mongoose from 'mongoose';
import Competition, { ICompetitionDocument } from '../models/Competition';
import Registration from '../models/Registration';
import User from '../models/User';
import { createError } from '../middleware/errorHandler';
import { COMPETITION_STATUS, REGISTRATION_STATUS, MAX_PAGE_SIZE } from '../utils/constants';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Serializes a competition document to a plain object,
 * replacing hostId with a populated host object and
 * injecting computedStatus as `status`.
 */
const serializeCompetition = (
  doc: ICompetitionDocument & { host?: object }
): object => {
  const obj = doc.toJSON() as Record<string, unknown>;
  // Expose computedStatus as `status` for the API consumer
  obj['status'] = doc.computedStatus;
  return obj;
};

// ── List Competitions (T4.3) ──────────────────────────────────────────────────
export const listCompetitions = async (
  page: number,
  limit: number,
  status?: string,
  search?: string
): Promise<{
  items: object[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_SIZE);
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * safeLimit;

  // Build query filter
  const filter: Record<string, unknown> = {};

  if (search?.trim()) {
    filter['$text'] = { $search: search.trim() };
  }

  // Fetch all matching docs (status is virtual, so we filter post-query for now)
  // For production at scale, status would be stored and indexed in the DB.
  const [all, _total] = await Promise.all([
    Competition.find(filter)
      .populate('hostId', 'name avatar email')
      .sort({ startDate: -1 })
      .lean({ virtuals: true }),
    Competition.countDocuments(filter),
  ]);

  // Filter by computed status if requested
  const filtered = status
    ? all.filter((c) => {
        const now = new Date();
        let cs: string;
        if (now < new Date(c.startDate as unknown as string)) cs = COMPETITION_STATUS.UPCOMING;
        else if (now > new Date(c.endDate as unknown as string)) cs = COMPETITION_STATUS.ENDED;
        else if ((c.registeredCount as number) >= (c.totalSpots as number)) cs = COMPETITION_STATUS.FULL;
        else cs = COMPETITION_STATUS.ACTIVE;
        return cs === status;
      })
    : all;

  // Paginate after virtual filter
  const paginated = filtered.slice(skip, skip + safeLimit);

  // Attach computedStatus as status in the response
  const items = paginated.map((c) => {
    const now = new Date();
    let cs: string;
    if (now < new Date(c.startDate as unknown as string)) cs = COMPETITION_STATUS.UPCOMING;
    else if (now > new Date(c.endDate as unknown as string)) cs = COMPETITION_STATUS.ENDED;
    else if ((c.registeredCount as number) >= (c.totalSpots as number)) cs = COMPETITION_STATUS.FULL;
    else cs = COMPETITION_STATUS.ACTIVE;

    const record = c as Record<string, unknown>;
    return { ...record, status: cs, host: record['hostId'], hostId: undefined };
  });

  return {
    items,
    total: filtered.length,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(filtered.length / safeLimit),
  };
};

// ── Get Single Competition (T4.4) ─────────────────────────────────────────────
export const getCompetition = async (
  competitionId: string,
  userId?: string
): Promise<object> => {
  if (!mongoose.Types.ObjectId.isValid(competitionId)) {
    throw createError('Invalid competition ID', 400);
  }

  const doc = await Competition.findById(competitionId).populate(
    'hostId',
    'name avatar email'
  );

  if (!doc) throw createError('Competition not found', 404);

  const obj = serializeCompetition(doc) as Record<string, unknown>;
  // Rename hostId → host
  obj['host'] = obj['hostId'];
  delete obj['hostId'];

  // Inject user's registration status if authenticated
  if (userId) {
    const reg = await Registration.findOne({
      userId,
      competitionId,
    });

    if (!reg) {
      obj['userRegistrationStatus'] = 'not_registered';
    } else if (reg.status === REGISTRATION_STATUS.ACTIVE) {
      obj['userRegistrationStatus'] = 'registered';
    } else {
      obj['userRegistrationStatus'] = 'withdrawn';
    }
  }

  return obj;
};

// ── Register for Competition (T4.5) ───────────────────────────────────────────
// This is the most critical endpoint — must be safe under concurrent load.
export const registerForCompetition = async (
  competitionId: string,
  userId: string
): Promise<{ message: string }> => {
  if (!mongoose.Types.ObjectId.isValid(competitionId)) {
    throw createError('Invalid competition ID', 400);
  }

  // ── Step 1: Check competition exists and is active ────────────────────────
  const competition = await Competition.findById(competitionId);
  if (!competition) throw createError('Competition not found', 404);

  const status = competition.computedStatus;
  if (status === COMPETITION_STATUS.UPCOMING) {
    throw createError('This competition has not started yet', 400);
  }
  if (status === COMPETITION_STATUS.ENDED) {
    throw createError('This competition has already ended', 400);
  }
  if (status === COMPETITION_STATUS.FULL) {
    throw createError('This competition is full', 409);
  }
  if (status === COMPETITION_STATUS.CANCELLED) {
    throw createError('This competition has been cancelled', 400);
  }

  // ── Step 2: Check for existing active registration ────────────────────────
  const existing = await Registration.findOne({ userId, competitionId });
  if (existing?.status === REGISTRATION_STATUS.ACTIVE) {
    throw createError('You are already registered for this competition', 409);
  }

  // ── Step 3: Atomically decrement spot counter ─────────────────────────────
  // The condition `registeredCount < totalSpots` ensures we never overbook,
  // even when thousands of users hit this simultaneously.
  const updated = await Competition.findOneAndUpdate(
    {
      _id: competitionId,
      $expr: { $lt: ['$registeredCount', '$totalSpots'] },
    },
    { $inc: { registeredCount: 1 } },
    { new: true }
  );

  if (!updated) {
    // Either competition disappeared or spots just ran out — both are safe 409s
    throw createError(
      'No spots available. The competition may have just filled up.',
      409
    );
  }

  // ── Step 4: Create or reactivate registration record ─────────────────────
  if (existing && existing.status === REGISTRATION_STATUS.WITHDRAWN) {
    // Reactivate withdrawn registration
    existing.status = REGISTRATION_STATUS.ACTIVE;
    existing.registeredAt = new Date();
    await existing.save();
  } else {
    // New registration — the unique index acts as a final safety net
    try {
      await Registration.create({ userId, competitionId });
    } catch (err: unknown) {
      // Unique index violation means concurrent duplicate — roll back the counter
      if ((err as { code?: number }).code === 11000) {
        await Competition.findByIdAndUpdate(competitionId, {
          $inc: { registeredCount: -1 },
        });
        throw createError('You are already registered for this competition', 409);
      }
      throw err;
    }
  }

  return { message: 'Successfully registered for the competition' };
};

// ── Withdraw from Competition (T4.6) ──────────────────────────────────────────
export const withdrawFromCompetition = async (
  competitionId: string,
  userId: string
): Promise<{ message: string }> => {
  if (!mongoose.Types.ObjectId.isValid(competitionId)) {
    throw createError('Invalid competition ID', 400);
  }

  const registration = await Registration.findOne({
    userId,
    competitionId,
    status: REGISTRATION_STATUS.ACTIVE,
  });

  if (!registration) {
    throw createError('You are not registered for this competition', 404);
  }

  // Mark as withdrawn
  registration.status = REGISTRATION_STATUS.WITHDRAWN;
  await registration.save();

  // Atomically increment spot counter back
  await Competition.findByIdAndUpdate(competitionId, {
    $inc: { registeredCount: -1 },
  });

  return { message: 'Successfully withdrawn from the competition' };
};

// ── Get Participants (T4.7) ───────────────────────────────────────────────────
export const getParticipants = async (
  competitionId: string,
  page: number,
  limit: number
): Promise<{
  items: object[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  if (!mongoose.Types.ObjectId.isValid(competitionId)) {
    throw createError('Invalid competition ID', 400);
  }

  const competition = await Competition.findById(competitionId);
  if (!competition) throw createError('Competition not found', 404);

  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_SIZE);
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * safeLimit;

  const [registrations, total] = await Promise.all([
    Registration.find({
      competitionId,
      status: REGISTRATION_STATUS.ACTIVE,
    })
      .populate('userId', 'name avatar email')
      .sort({ registeredAt: 1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Registration.countDocuments({
      competitionId,
      status: REGISTRATION_STATUS.ACTIVE,
    }),
  ]);

  const items = registrations.map((r) => ({
    ...(r['userId'] as object),
    registeredAt: r.registeredAt,
  }));

  return {
    items,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
};

// ── Seed Helper (T4.8) ────────────────────────────────────────────────────────
export const seedCompetitions = async (hostId: string): Promise<void> => {
  const existing = await Competition.countDocuments();
  if (existing > 0) {
    console.info('Seed skipped — competitions already exist');
    return;
  }

  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  await Competition.insertMany([
    {
      title: 'Spring Coding Blitz',
      description:
        'A 48-hour hackathon open to all skill levels. Build something amazing with React Native and compete for the top prize.',
      category: 'Hackathon',
      startDate: new Date(now.getTime() + 3 * day),
      endDate: new Date(now.getTime() + 5 * day),
      totalSpots: 100,
      registeredCount: 42,
      entryFee: 0,
      prizePool: '₹50,000 cash + internship opportunities',
      rules: [
        'Solo or teams of up to 3 members',
        'Project must be started during the hackathon window',
        'Must use React Native for the frontend',
        'Submit a GitHub repo + demo video',
        'Plagiarism will result in immediate disqualification',
      ],
      hostId,
      bannerImage:
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    },
    {
      title: 'UI/UX Design Sprint',
      description:
        'Design the best mobile app UI in 24 hours. Judged on creativity, usability, and visual appeal. All design tools allowed.',
      category: 'Design',
      startDate: new Date(now.getTime() - 1 * day),
      endDate: new Date(now.getTime() + 2 * day),
      totalSpots: 50,
      registeredCount: 31,
      entryFee: 0,
      prizePool: '₹25,000 + Adobe Creative Cloud subscription',
      rules: [
        'Individual participation only',
        'Submit Figma or XD files',
        'Must include a prototype with at least 5 screens',
        'No pre-made templates',
        'Originality is heavily weighted in judging',
      ],
      hostId,
      bannerImage:
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    },
    {
      title: 'Algorithm Arena — Season 3',
      description:
        'Competitive programming challenge with 5 problems of increasing difficulty. Fastest correct solutions win.',
      category: 'Competitive Programming',
      startDate: new Date(now.getTime() - 4 * day),
      endDate: new Date(now.getTime() - 1 * day),
      totalSpots: 200,
      registeredCount: 198,
      entryFee: 0,
      prizePool: '₹1,00,000 prize pool split among top 3',
      rules: [
        'Any programming language allowed',
        'No external libraries for algorithmic problems',
        'Partial scoring enabled for subtasks',
        'Anti-cheat monitoring is active',
        'Decisions by judges are final',
      ],
      hostId,
      bannerImage:
        'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800',
    },
    {
      title: 'Full-Stack Build Challenge',
      description:
        'Build a complete full-stack application in 72 hours. Must include a React Native frontend and a Node.js backend connected to a real database.',
      category: 'Full-Stack',
      startDate: new Date(now.getTime() - 1 * day),
      endDate: new Date(now.getTime() + 3 * day),
      totalSpots: 75,
      registeredCount: 75,
      entryFee: 0,
      prizePool: '₹75,000 + mentorship from industry experts',
      rules: [
        'Teams of 1–2 members',
        'Must deploy the app — provide a working URL',
        'React Native required for mobile frontend',
        'Node.js + Express required for backend',
        'Code must be pushed to a public GitHub repo',
      ],
      hostId,
      bannerImage:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    },
  ]);

  console.info('✅ Database seeded with 4 sample competitions');
};

// ── Get User Registration Status ──────────────────────────────────────────────
export const getUserRegistrationStatus = async (
  competitionId: string,
  userId: string
): Promise<{ status: string }> => {
  const reg = await Registration.findOne({ userId, competitionId });
  if (!reg) return { status: 'not_registered' };
  return { status: reg.status === REGISTRATION_STATUS.ACTIVE ? 'registered' : 'withdrawn' };
};

// ── Ensure seed host exists ───────────────────────────────────────────────────
export const getOrCreateSeedHost = async (): Promise<string> => {
  let host = await User.findOne({ email: 'admin@feedants.com' }).lean();
  if (!host) {
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash('Admin1234', 12);
    const created = await User.create({
      name: 'Feedants Admin',
      email: 'admin@feedants.com',
      passwordHash,
    });
    return created._id.toString();
  }
  return (host._id as mongoose.Types.ObjectId).toString();
};
