export type Role = 'ADMIN' | 'BORROWER' | 'SANCTION' | 'DISBURSEMENT' | 'COLLECTION';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}
