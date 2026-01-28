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

  private generatePassword(length = 12) {
    return crypto.randomBytes(length).toString('base64').slice(0, length);
  }

  async createUserWithPassword(email: string, role: string) {
    const tempPassword = this.generatePassword();

    const userAttrs: any = {
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role },
    };

    userAttrs['password_update_required'] = true;

    const { data, error } = await this.supabase.auth.admin.createUser(userAttrs);

    if (error) throw new BadRequestException(error.message);

    const createdUser = data.user; // <-- destructure the actual user

    const transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: Number(this.config.get<string>('SMTP_PORT')),
      secure: Number(this.config.get<string>('SMTP_PORT')) === 465,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });

    try {
      await transporter.sendMail({
        from: `"HQ Admin" <${this.config.get<string>('SMTP_FROM')}>`,
        to: email,
        subject: 'Your Account Credentials',
        text: `Your account has been created.\n\nEmail: ${email}\nTemporary Password: ${tempPassword}\n\nPlease log in and change your password immediately.`,
      });
    } catch (err: any) {
      if (createdUser?.id) {
        await this.supabase.auth.admin.deleteUser(createdUser.id);
      }
      throw new BadRequestException(`Failed to send email: ${err.message}`);
    }

    return createdUser; // return just the user object
  }
}
