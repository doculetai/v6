const SUPABASE_URL = 'http://127.0.0.1:54401';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const headers = { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` };

// Get all rows to see columns
const r = await fetch(`${SUPABASE_URL}/rest/v1/student_profiles?limit=1`, { headers });
const data = await r.json();
console.log('student_profiles:', JSON.stringify(data, null, 2));

const r2 = await fetch(`${SUPABASE_URL}/rest/v1/profiles?limit=2`, { headers });
const data2 = await r2.json();
console.log('profiles:', JSON.stringify(data2, null, 2));
