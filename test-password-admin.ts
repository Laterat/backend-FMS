import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper to generate temporary password
function generateTempPassword(length = 12) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

// List of Branch Admin emails you want to fix
const branchAdmins = [
  'branchadmin1@example.com',
  'branchadmin2@example.com',
];

async function setTempPasswordAndGetJWT() {
  for (const email of branchAdmins) {
    // 1️⃣ Find user by email
   // 1️⃣ Find user by email
const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers({
  page: 1,        // start with first page
  perPage: 100,   // max 100 users per page
});


    if (listError) {
      console.error(`Error fetching users: ${listError.message}`);
      continue;
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      console.error(`User not found: ${email}`);
      continue;
    }

    const tempPassword = generateTempPassword();

    // 2️⃣ Update password using user.id
    const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: tempPassword,
      email_confirm: true,
    });

    if (updateError) {
      console.error(`Failed to update password for ${email}: ${updateError.message}`);
      continue;
    }

    console.log(`✅ Password set for ${email}: ${tempPassword}`);

    // ⚠ Supabase admin client cannot login users to get JWT
    // You need to use Supabase client with anon key or REST API to get JWT
    console.log(`Now use this password to log in via POST https://<YOUR-SUPABASE_URL>/auth/v1/token?grant_type=password`);
    console.log('------------------------');
  }
}

setTempPasswordAndGetJWT().then(() => console.log('All done!')).catch(console.error);
