const SUPABASE_URL = 'http://127.0.0.1:54401';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const h = { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };

const userId = '27a66fdf-ad73-40ed-b658-9de7170162a5';

// Get a school and program
const s = await (await fetch(`${SUPABASE_URL}/rest/v1/schools?select=id&limit=1`, { headers: h })).json();
const p = await (await fetch(`${SUPABASE_URL}/rest/v1/programs?select=id&school_id=eq.${s[0].id}&limit=1`, { headers: h })).json();

// 1. Update profiles: onboarding_complete = true
const r1 = await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}`, {
  method: 'PATCH', headers: h, body: JSON.stringify({ onboarding_complete: true }),
});
console.log('profiles update:', r1.status);

// 2. Update student_profiles: school_id + program_id
const r2 = await fetch(`${SUPABASE_URL}/rest/v1/student_profiles?user_id=eq.${userId}`, {
  method: 'PATCH', headers: h,
  body: JSON.stringify({ school_id: s[0].id, program_id: p[0].id }),
});
console.log('student_profiles update:', r2.status);
console.log('Done — school:', s[0].id, 'program:', p[0].id);
