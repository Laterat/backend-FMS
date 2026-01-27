import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://yqcmvojhxmpjrfzfbtiq.supabase.co",
 "sb_publishable_wddJP1WfdXOX8Iw53HNx1g_SROt3WlR"
);


async function main() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'mekonnenlatera@gmail.com',
    password: '@YBsG_.hEMh8C#c', // must match the seeded password
  });

  if (error) {
    console.error('Login failed:', error.message);
    return;
  }

  console.log('HQ Admin JWT:', data.session?.access_token);
}

main();