
export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'viewer';
  last_login?: string;
}

export interface AdminSession {
  id: string;
  admin_id: string;
  session_token: string;
  expires_at: string;
  created_at: string;
  last_accessed: string;
}

export interface StoredSessionData {
  user: AdminUser;
  sessionToken: string;
  expiresAt: number;
}
