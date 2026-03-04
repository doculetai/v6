import postgres from 'postgres';
const sql = postgres('postgresql://postgres:postgres@127.0.0.1:54402/postgres');

// Fix tuition amounts: 1 NGN = 100 kobo
// ₦2.5M = 250,000,000 kobo; ₦4.8M = 480,000,000 kobo; ₦1.2M = 120,000,000 kobo
await sql`
  UPDATE programs SET tuition_amount = CASE
    WHEN name LIKE '%Computer Science%' THEN 250000000
    WHEN name LIKE '%MBA%' THEN 480000000
    WHEN name LIKE '%Engineering%' THEN 120000000
    ELSE tuition_amount * 100
  END
`;

console.log('Tuition amounts fixed!');
await sql.end();
