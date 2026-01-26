// src/auth/current-user.interface.ts
import { UserRole } from '@prisma/client';

export interface CurrentUserI {
  id: string;
  email: string;
  role: UserRole;
  branchId?: string;
}
