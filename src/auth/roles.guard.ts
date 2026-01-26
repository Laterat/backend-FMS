import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    if (!allowedRoles) return true;

    const req = context.switchToHttp().getRequest();
    return allowedRoles.includes(req.user.role);
  }
}
