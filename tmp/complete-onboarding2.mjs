const SUPABASE_URL = 'http://127.0.0.1:54401';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

const userId = '27a66fdf-ad73-40ed-b658-9de7170162a5';

// Get schools
const schoolsRes = await fetch(`${SUPABASE_URL}/rest/v1/schools?select=id,name&limit=1`, { headers });
const schools = await schoolsRes.json();
const school = schools[0];

const programsRes = await fetch(`${SUPABASE_URL}/rest/v1/programs?select=id,name&school_id=eq.${school.id}&limit=1`, { headers });
const programs = await programsRes.json();
const program = programs[0];
console.log('School:', school.name, 'Program:', program.name);

// Check current student_profiles state
const spRes = await fetch(`${SUPABASE_URL}/rest/v1/student_profiles?id=eq.${userId}&select=*`, { headers });
const sp = await spRes.json();
console.log('Current student_profiles:', JSON.stringify(sp[0], null, 2));

// Update
const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/student_profiles?id=eq.${userId}`, {
  method: 'PATCH',
  headers: { ...headers, 'Prefer': 'return=minimal' },
  body: JSON.stringify({
    onboarding_complete: true,
    funding_type: 'sponsor',
    school_id: school.id,
    program_id: program.id,
  }),
});
const updateText = await updateRes.text();
console.log('Update status:', updateRes.status, updateText);

