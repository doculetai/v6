import postgres from 'postgres';
const sql = postgres('postgresql://postgres:postgres@127.0.0.1:54402/postgres');

// Remove the original University of Lagos (the one with only 1 program from first seed)
const [dup] = await sql`
  SELECT id FROM schools WHERE name = 'University of Lagos'
  ORDER BY created_at ASC LIMIT 1
`;
if (dup) {
  await sql`DELETE FROM schools WHERE id = ${dup.id}`;
  console.log('Removed duplicate University of Lagos');
}

// Verify
const schools = await sql`SELECT name, country FROM schools ORDER BY name`;
console.log('Schools:', schools.map(s => s.name));
await sql.end();
