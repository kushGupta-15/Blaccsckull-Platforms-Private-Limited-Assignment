import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CompetitionStatus } from '../types';

dayjs.extend(duration);
dayjs.extend(relativeTime);

/**
 * Derives the competition status from its dates and capacity.
 * Used as a client-side fallback if the backend status field is stale.
 */
export const deriveCompetitionStatus = (
  startDate: string,
  endDate: string,
  registeredCount: number,
  totalSpots: number,
  backendStatus: CompetitionStatus
): CompetitionStatus => {
  if (backendStatus === 'cancelled') return 'cancelled';

  const now = dayjs();
  if (now.isBefore(dayjs(startDate))) return 'upcoming';
  if (now.isAfter(dayjs(endDate))) return 'ended';
  if (registeredCount >= totalSpots) return 'full';
  return 'active';
};

/**
 * Returns a human-readable countdown string or end message.
 */
export const getCountdownLabel = (
  status: CompetitionStatus,
  startDate: string,
  endDate: string
): string => {
  const now = dayjs();
  if (status === 'upcoming') {
    return `Starts ${dayjs(startDate).fromNow()}`;
  }
  if (status === 'active') {
    return `Ends ${dayjs(endDate).fromNow()}`;
  }
  if (status === 'ended') return 'Ended';
  if (status === 'full') return 'Full';
  if (status === 'cancelled') return 'Cancelled';
  return '';
};

/**
 * Formats a date string for display.
 */
export const formatDate = (dateStr: string): string =>
  dayjs(dateStr).format('MMM D, YYYY');

/**
 * Returns seconds remaining until a target date, clamped to 0.
 */
export const secondsUntil = (dateStr: string): number =>
  Math.max(0, dayjs(dateStr).diff(dayjs(), 'second'));

/**
 * Breaks total seconds into DD / HH / MM / SS parts.
 */
export const formatCountdown = (
  totalSeconds: number
): { days: string; hours: string; minutes: string; seconds: string } => {
  const d = dayjs.duration(totalSeconds, 'seconds');
  const pad = (n: number): string => String(n).padStart(2, '0');
  return {
    days: pad(Math.floor(d.asDays())),
    hours: pad(d.hours()),
    minutes: pad(d.minutes()),
    seconds: pad(d.seconds()),
  };
};
