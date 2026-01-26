import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  private supabase: SupabaseClient;

  constructor(private prisma: PrismaService) { 
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY is not set!');
    this.supabase = createClient(url, key);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedException('Missing Authorization');

    const token = authHeader.replace('Bearer ', '');
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error || !data.user) throw new UnauthorizedException('Invalid token');

    // Fetch user role from local DB
    const user = await this.prisma.user.findUnique({
      where: { id: data.user.id },
    });

    if (!user) throw new UnauthorizedException('User not found in DB');

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,      // <--- attach the role here
      branchId: user.branchId,
    };

    return true;
  }
}
