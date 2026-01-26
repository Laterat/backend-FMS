import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseAdminService {
    private supabase: SupabaseClient;

  constructor(private config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !key) {
      throw new Error('Supabase environment variables are missing');
    }

    this.supabase = createClient(url, key);
  }

  // Invite user via email
  async inviteUserByEmail(email: string) {
    const { data, error } = await this.supabase.auth.admin.inviteUserByEmail(email);
    if (error) throw new BadRequestException(error.message);
    return data.user;
  }
}
