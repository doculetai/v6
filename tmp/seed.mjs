import postgres from 'postgres';

const sql = postgres('postgresql://postgres:postgres@127.0.0.1:54402/postgres');

const STUDENT_AUTH_ID = '27a66fdf-ad73-40ed-b658-9de7170162a5';

async function seed() {
  // Insert into users table
  await sql`
    INSERT INTO users (id, email) 
    VALUES (${STUDENT_AUTH_ID}, 'kemi@test.com')
    ON CONFLICT (id) DO NOTHING
  `;

  // Insert profile
  await sql`
    INSERT INTO profiles (user_id, role, onboarding_complete)
    VALUES (${STUDENT_AUTH_ID}, 'student', false)
    ON CONFLICT (user_id) DO NOTHING
  `;

  // Insert student profile  
  await sql`
    INSERT INTO student_profiles (user_id, funding_type, kyc_status, bank_status, onboarding_step)
    VALUES (${STUDENT_AUTH_ID}, 'sponsor', 'not_started', 'not_started', 1)
    ON CONFLICT (user_id) DO NOTHING
  `;

  // Insert a test school
  const [school] = await sql`
    INSERT INTO schools (name, country, logo_url)
    VALUES ('University of Lagos', 'Nigeria', null)
    RETURNING id
  `;

  // Insert a test program
  await sql`
    INSERT INTO programs (school_id, name, tuition_amount, currency, duration_months)
    VALUES (${school.id}, 'MSc Computer Science', 2500000, 'NGN', 24)
  `;

  console.log('Seed complete!');
  await sql.end();
}

seed().catch(console.error);
