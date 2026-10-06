import apiClient from './client';
import {
  ICompetition,
  IUser,
  ApiSuccess,
  PaginatedResponse,
} from '../types';

export interface CompetitionListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const fetchCompetitions = async (
  params: CompetitionListParams = {}
): Promise<PaginatedResponse<ICompetition>> => {
  const { data } = await apiClient.get<
    ApiSuccess<PaginatedResponse<ICompetition>>
  >('/competitions', { params });
  return data.data;
};

export const fetchCompetition = async (
  id: string
): Promise<ICompetition> => {
  const { data } = await apiClient.get<ApiSuccess<ICompetition>>(
    `/competitions/${id}`
  );
  return data.data;
};

export const fetchParticipants = async (
  id: string,
  params: { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<IUser>> => {
  const { data } = await apiClient.get<
    ApiSuccess<PaginatedResponse<IUser>>
  >(`/competitions/${id}/participants`, { params });
  return data.data;
};

export const registerForCompetition = async (
  id: string
): Promise<{ message: string }> => {
  const { data } = await apiClient.post<
    ApiSuccess<{ message: string }>
  >(`/competitions/${id}/register`);
  return data.data;
};

export const withdrawFromCompetition = async (
  id: string
): Promise<{ message: string }> => {
  const { data } = await apiClient.delete<
    ApiSuccess<{ message: string }>
  >(`/competitions/${id}/register`);
  return data.data;
};

export const fetchMyRegistrations = async (
  params: { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<ICompetition>> => {
  const { data } = await apiClient.get<
    ApiSuccess<PaginatedResponse<ICompetition>>
  >('/users/me/registrations', { params });
  return data.data;
};

// ── Host / Organizer Operations (Phase 9) ────────────────────────────────────
export const createCompetition = async (
  input: import('../types').CreateCompetitionInput
): Promise<ICompetition> => {
  const { data } = await apiClient.post<ApiSuccess<ICompetition>>(
    '/competitions',
    input
  );
  return data.data;
};

export const updateCompetition = async (
  id: string,
  input: Partial<import('../types').CreateCompetitionInput>
): Promise<ICompetition> => {
  const { data } = await apiClient.put<ApiSuccess<ICompetition>>(
    `/competitions/${id}`,
    input
  );
  return data.data;
};

export const fetchHostedCompetitions = async (): Promise<ICompetition[]> => {
  const { data } = await apiClient.get<ApiSuccess<ICompetition[]>>(
    '/competitions/hosted/me'
  );
  return data.data;
};

export const fetchCompetitionAdminStats = async (
  id: string
): Promise<import('../types').CompetitionAdminStats> => {
  const { data } = await apiClient.get<
    ApiSuccess<import('../types').CompetitionAdminStats>
  >(`/competitions/${id}/admin-stats`);
  return data.data;
};

// ── Submissions & Winners Operations (Phase 10 & 11) ─────────────────────────

export const submitProject = async (
  competitionId: string,
  input: import('../types').CreateSubmissionInput
): Promise<import('../types').ISubmission> => {
  const { data } = await apiClient.post<
    ApiSuccess<import('../types').ISubmission>
  >(`/competitions/${competitionId}/submissions`, input);
  return data.data;
};

export const fetchSubmissions = async (
  competitionId: string
): Promise<{ items: import('../types').ISubmission[]; total: number }> => {
  const { data } = await apiClient.get<
    ApiSuccess<{ items: import('../types').ISubmission[]; total: number }>
  >(`/competitions/${competitionId}/submissions`);
  return data.data;
};

export const fetchMySubmission = async (
  competitionId: string
): Promise<import('../types').ISubmission | null> => {
  const { data } = await apiClient.get<
    ApiSuccess<import('../types').ISubmission | null>
  >(`/competitions/${competitionId}/submissions/mine`);
  return data.data;
};

export const toggleUpvoteSubmission = async (
  submissionId: string
): Promise<{ hasUpvoted: boolean; upvoteCount: number }> => {
  const { data } = await apiClient.post<
    ApiSuccess<{ hasUpvoted: boolean; upvoteCount: number }>
  >(`/submissions/${submissionId}/upvote`);
  return data.data;
};

export const evaluateSubmission = async (
  submissionId: string,
  input: import('../types').EvaluateSubmissionInput
): Promise<import('../types').ISubmission> => {
  const { data } = await apiClient.put<
    ApiSuccess<import('../types').ISubmission>
  >(`/submissions/${submissionId}/evaluate`, input);
  return data.data;
};

export const finalizeWinners = async (
  competitionId: string,
  winners: Array<{ submissionId: string; rank: 1 | 2 | 3 }>
): Promise<import('../types').ISubmission[]> => {
  const { data } = await apiClient.post<
    ApiSuccess<import('../types').ISubmission[]>
  >(`/competitions/${competitionId}/finalize-winners`, { winners });
  return data.data;
};

export const fetchWinners = async (
  competitionId: string
): Promise<import('../types').ISubmission[]> => {
  const { data } = await apiClient.get<
    ApiSuccess<import('../types').ISubmission[]>
  >(`/competitions/${competitionId}/winners`);
  return data.data;
};
