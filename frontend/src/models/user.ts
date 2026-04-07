export type UserRole = 'A' | 'T' | 'S';

export interface User {
  id: string;
  _id?: string;  // MongoDB ID
  name?: string; // Optional name field for compatibility
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: UserRole;
  password?: string;
  details?: any;
}

export interface MenuItem {
  path: string;
  icon: string;
  label: string;
  disabled?: boolean;
}
