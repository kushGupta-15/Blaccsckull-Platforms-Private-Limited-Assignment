import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import Registration from '../models/Registration';
import Competition from '../models/Competition';
import { REGISTRATION_STATUS, COMPETITION_STATUS } from '../utils/constants';

/**
 * GET /api/v1/users/me/registrations
 * Returns all active competitions the current user is registered for,
 * with full competition details and computed status.
 */
export const getMyRegistrations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const page  = (req.query.page as unknown as number) ?? 1;
    const limit = (req.query.limit as unknown as number) ?? 20;
    const skip  = (page - 1) * limit;

    // Get all active registrations for this user
    const [registrations, total] = await Promise.all([
      Registration.find({ userId, status: REGISTRATION_STATUS.ACTIVE })
        .sort({ registeredAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Registration.countDocuments({ userId, status: REGISTRATION_STATUS.ACTIVE }),
    ]);

    if (registrations.length === 0) {
      sendSuccess(res, {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      });
      return;
    }

    // Fetch full competition details for each registration
    const competitionIds = registrations.map((r) => r.competitionId);
    const competitions = await Competition.find({ _id: { $in: competitionIds } })
      .populate('hostId', 'name avatar email')
      .lean({ virtuals: true });

    // Build a map for quick lookup
    const compMap = new Map(
      competitions.map((c) => [c._id.toString(), c])
    );

    // Merge and compute status
    const now = new Date();
    const items = registrations
      .map((reg) => {
        const comp = compMap.get(reg.competitionId.toString());
        if (!comp) return null;

        let cs: string;
        if (now < new Date(comp.startDate as unknown as string)) cs = COMPETITION_STATUS.UPCOMING;
        else if (now > new Date(comp.endDate as unknown as string)) cs = COMPETITION_STATUS.ENDED;
        else if ((comp.registeredCount as number) >= (comp.totalSpots as number)) cs = COMPETITION_STATUS.FULL;
        else cs = COMPETITION_STATUS.ACTIVE;

        const record = comp as Record<string, unknown>;
        return {
          ...record,
          status: cs,
          host: record['hostId'],
          hostId: undefined,
          userRegistrationStatus: 'registered',
          registeredAt: reg.registeredAt,
        };
      })
      .filter(Boolean);

    sendSuccess(res, {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};
