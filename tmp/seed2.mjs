import postgres from 'postgres';

const sql = postgres('postgresql://postgres:postgres@127.0.0.1:54402/postgres');

async function seed() {
  // Add more schools
  const schools = [
    { name: 'University of Lagos', country: 'Nigeria' },
    { name: 'Covenant University', country: 'Nigeria' },
    { name: 'University of Toronto', country: 'Canada' },
    { name: 'Imperial College London', country: 'United Kingdom' },
    { name: 'University of Cape Town', country: 'South Africa' },
  ];

  for (const s of schools) {
    const [school] = await sql`
      INSERT INTO schools (name, country)
      VALUES (${s.name}, ${s.country})
      ON CONFLICT DO NOTHING
      RETURNING id
    `;
    if (!school) continue;

    // Add programs for each school
    await sql`
      INSERT INTO programs (school_id, name, tuition_amount, currency, duration_months)
      VALUES 
        (${school.id}, 'MSc Computer Science', 2500000, 'NGN', 24),
        (${school.id}, 'MBA Business Administration', 4800000, 'NGN', 18),
        (${school.id}, 'BSc Engineering', 1200000, 'NGN', 48)
      ON CONFLICT DO NOTHING
    `;
  }

  console.log('Seed 2 complete!');
  await sql.end();
}

seed().catch(console.error);
