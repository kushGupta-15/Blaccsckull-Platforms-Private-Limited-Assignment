import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  fetchCompetition,
  fetchParticipants,
  registerForCompetition,
  withdrawFromCompetition,
} from '../api/competitions';
import { ApiError } from '../types';

// ── Query Keys ────────────────────────────────────────────────────────────────
export const competitionKeys = {
  detail: (id: string) => ['competition', id] as const,
  participants: (id: string) => ['competition', id, 'participants'] as const,
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
