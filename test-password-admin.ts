import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!; // for login

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function generateTempPassword(length = 12) {
  return Math.random().toString(36).slice(-length) + 'A1!'; // simple temp password
}

async function resetBranchAdminPassword(email: string) {
  // 1️⃣ List users
  const { data: listData, error: listError } =
    await supabaseAdmin.auth.admin.listUsers();

  if (listError) throw listError;

  const users = listData.users;
  const user = users.find(u => u.email === email);

  if (!user) {
    throw new Error(`User with email ${email} not found`);
  }

  console.log(`Found user: ${user.id} (${user.email})`);

  // 2️⃣ Generate temp password
  const tempPassword = generateTempPassword();

  // 3️⃣ Update password
  const { data: updateData, error: updateError } =
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: tempPassword,
      email_confirm: true,
    });

  if (updateError) throw updateError;

  console.log(`Temporary password set for ${email}`);

  // 4️⃣ Login to get JWT
  const { data: loginData, error: loginError } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password: tempPassword,
    });

  if (loginError) throw loginError;

  return loginData.session?.access_token;
}


// 🔹 Replace these emails with your branch admins
const branchAdminEmails = [
  'lateramekonnen@gmail.com',
  'laterascholar@gmail.com',
];

async function main() {
  for (const email of branchAdminEmails) {
    try {
      const token = await resetBranchAdminPassword(email);
      console.log(`\nUse this JWT in Thunder Client for ${email}:\n${token}\n`);
    } catch (err) {
      console.error(`Error for ${email}:`, err.message || err);
    }
  }
}

main();
