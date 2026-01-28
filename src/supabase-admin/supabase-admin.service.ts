import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

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

  // Generate secure password
  private generatePassword(length = 12) {
    return crypto.randomBytes(length).toString('base64').slice(0, length);
  }

  // Create user and send password via email
  async createUserWithPassword(email: string, role: string) {
    const tempPassword = this.generatePassword();

    const { data: user, error } = await this.supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // optional, marks email as verified
      user_metadata: { role },
    });

    if (error) throw new BadRequestException(error.message);

    // Send password via email
    const transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT'),
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });

    await transporter.sendMail({
      from: `"HQ Admin" <${this.config.get<string>('SMTP_FROM')}>`,
      to: email,
      subject: 'Your Account Credentials',
      text: `Your account has been created.\n\nEmail: ${email}\nTemporary Password: ${tempPassword}\n\nPlease log in and change your password immediately.`,
    });

    return user;
  }
}
