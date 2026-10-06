import apiClient from './client';
import { IUser, ApiSuccess } from '../types';

export interface AuthPayload {
  token: string;
  user: IUser;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async (
  input: RegisterInput
): Promise<AuthPayload> => {
  const { data } = await apiClient.post<ApiSuccess<AuthPayload>>(
    '/auth/register',
    input
  );
  return data.data;
};

export const loginUser = async (
  input: LoginInput
): Promise<AuthPayload> => {
  const { data } = await apiClient.post<ApiSuccess<AuthPayload>>(
    '/auth/login',
    input
  );
  return data.data;
};

export const fetchCurrentUser = async (): Promise<IUser> => {
  const { data } = await apiClient.get<ApiSuccess<IUser>>('/auth/me');
  return data.data;
};
