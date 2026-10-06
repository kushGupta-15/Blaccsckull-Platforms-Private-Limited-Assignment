import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  fetchCompetition,
  fetchParticipants,
  registerForCompetition,
  withdrawFromCompetition,
  fetchSubmissions,
  fetchMySubmission,
  fetchWinners,
} from '../api/competitions';
import { ApiError } from '../types';

// ── Query Keys ────────────────────────────────────────────────────────────────
export const competitionKeys = {
  detail: (id: string) => ['competition', id] as const,
  participants: (id: string) => ['competition', id, 'participants'] as const,
  submissions: (id: string) => ['competition', id, 'submissions'] as const,
  mySubmission: (id: string) => ['competition', id, 'my-submission'] as const,
  winners: (id: string) => ['competition', id, 'winners'] as const,
};

// ── useCompetition ────────────────────────────────────────────────────────────
export const useCompetition = (id: string) =>
  useQuery({
    queryKey: competitionKeys.detail(id),
    queryFn: () => fetchCompetition(id),
    staleTime: 1000 * 30,       // 30 seconds
    refetchOnWindowFocus: true,
    retry: 2,
  });

// ── useParticipants ───────────────────────────────────────────────────────────
export const useParticipants = (id: string, limit = 6) =>
  useQuery({
    queryKey: competitionKeys.participants(id),
    queryFn: () => fetchParticipants(id, { limit }),
    staleTime: 1000 * 60,
  });

// ── useRegister ───────────────────────────────────────────────────────────────
export const useRegister = (competitionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => registerForCompetition(competitionId),
    onSuccess: () => {
      // Invalidate so the detail re-fetches with updated status + count
      void qc.invalidateQueries({ queryKey: competitionKeys.detail(competitionId) });
      void qc.invalidateQueries({ queryKey: competitionKeys.participants(competitionId) });
    },
    onError: (err: AxiosError<ApiError>) => err, // caller handles
  });
};

// ── useWithdraw ───────────────────────────────────────────────────────────────
export const useWithdraw = (competitionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => withdrawFromCompetition(competitionId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: competitionKeys.detail(competitionId) });
      void qc.invalidateQueries({ queryKey: competitionKeys.participants(competitionId) });
    },
    onError: (err: AxiosError<ApiError>) => err,
  });
};

// ── useSubmissions (Phase 10: T10.3) ──────────────────────────────────────────
export const useSubmissions = (competitionId: string) =>
  useQuery({
    queryKey: competitionKeys.submissions(competitionId),
    queryFn: () => fetchSubmissions(competitionId),
    staleTime: 1000 * 15, // 15 seconds
  });

// ── useMySubmission (Phase 10: T10.3) ─────────────────────────────────────────
export const useMySubmission = (competitionId: string, enabled = true) =>
  useQuery({
    queryKey: competitionKeys.mySubmission(competitionId),
    queryFn: () => fetchMySubmission(competitionId),
    enabled,
    staleTime: 1000 * 30,
  });

// ── useWinners (Phase 11: T11.1) ──────────────────────────────────────────────
export const useWinners = (competitionId: string) =>
  useQuery({
    queryKey: competitionKeys.winners(competitionId),
    queryFn: () => fetchWinners(competitionId),
    staleTime: 1000 * 30,
  });
