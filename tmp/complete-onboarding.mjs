// Mark kemi@test.com onboarding as complete and set a school/program
const SUPABASE_URL = 'http://127.0.0.1:54401';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

// 1. Get user id
const userRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_user_by_email`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ email_arg: 'kemi@test.com' }),
});

// Try auth admin API instead
const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=kemi@test.com`, {
  headers: { 'Authorization': `Bearer ${SERVICE_KEY}`, 'apikey': SERVICE_KEY },
});
const listData = await listRes.json();
const userId = listData.users?.[0]?.id;
console.log('User ID:', userId);

if (!userId) { console.error('User not found'); process.exit(1); }

// 2. Get a school + program
const schoolsRes = await fetch(`${SUPABASE_URL}/rest/v1/schools?select=id,name,programs(id,name)&limit=1`, { headers });
const schools = await schoolsRes.json();
const school = schools[0];
const program = school?.programs?.[0];
console.log('School:', school?.name, '| Program:', program?.name);

// 3. Update student_profiles
const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/student_profiles?id=eq.${userId}`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({
    onboarding_complete: true,
    funding_type: 'sponsor',
    school_id: school?.id ?? null,
    program_id: program?.id ?? null,
  }),
});
console.log('Update status:', updateRes.status);

