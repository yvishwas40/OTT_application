import { SetMetadata } from '@nestjs/common';

export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);