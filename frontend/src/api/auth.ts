import api, { setStoredToken, clearStoredToken } from './client';

export type User = {
  id: string;
  email: string;
  name: string | null;
};

export type AuthResult = {
  user: User;
  token: string;
};

export async function register(
  email: string,
  password: string,
  name?: string
): Promise<AuthResult> {
  const { data } = await api.post<{ success: true; data: AuthResult }>(
    '/auth/register',
    { email, password, name }
  );
  if (!data.success || !data.data) throw new Error('Register failed');
  setStoredToken(data.data.token);
  return data.data;
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const { data } = await api.post<{ success: true; data: AuthResult }>(
    '/auth/login',
    { email, password }
  );
  if (!data.success || !data.data) throw new Error('Login failed');
  setStoredToken(data.data.token);
  return data.data;
}

export async function fetchMe(): Promise<User | null> {
  try {
    const { data } = await api.get<{ success: true; data: { user: User } }>('/auth/me');
    if (!data.success || !data.data?.user) return null;
    return data.data.user;
  } catch {
    return null;
  }
}

export async function updateProfile(name: string | null): Promise<User> {
  const { data } = await api.patch<{ success: true; data: { user: User } }>('/auth/me', {
    name: name === '' ? null : name,
  });
  if (!data.success || !data.data?.user) throw new Error('Update failed');
  return data.data.user;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const { data } = await api.post<{ success: true; data: { ok: boolean } }>(
    '/auth/change-password',
    { currentPassword, newPassword }
  );
  if (!data.success) throw new Error('Change password failed');
}

export function logout(): void {
  clearStoredToken();
}
