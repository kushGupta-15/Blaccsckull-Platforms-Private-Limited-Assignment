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
