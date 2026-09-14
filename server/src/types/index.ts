// Shared server-side TypeScript types

/** Safe user object returned to clients — no passwordHash */
export interface SafeUser {
  id: string;
  _id: unknown;
  email: string;
  name: string;
  role: 'admin' | 'viewer';
  createdAt?: Date;
  updatedAt?: Date;
}

/** Standard API response envelope */
export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}
