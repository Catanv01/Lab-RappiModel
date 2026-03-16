export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

export enum UserRole {
  CONSUMER = 'consumer',
  STORE = 'store',
  DELIVERY = 'delivery',
}

export interface CreateUserDTO {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  storeName?: string | null;
}

export interface AuthenticateUserDTO {
  email: string;
  password: string;
}
