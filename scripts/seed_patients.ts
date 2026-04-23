import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const districts = ['REWA', 'SATNA', 'SIDHI', 'SINGRAULI', 'JABALPUR'];
const statuses = ['pending_consultation', 'pending_meal', 'complete'];
const genders = ['male', 'female', 'other'];

async function seedData(count = 1000) {
  console.log(`🚀 Seeding ${count} patients...`);
  
  const patients = [];
  for (let i = 0; i < count; i++) {
    const firstName = ['Amit', 'Raj', 'Priya', 'Sita', 'Rahul', 'Sneha', 'Vikram'][Math.floor(Math.random() * 7)];
    const lastName = ['Kumar', 'Singh', 'Patel', 'Sharma', 'Verma', 'Gupta'][Math.floor(Math.random() * 6)];
    
    patients.push({
      name: `${firstName} ${lastName} ${i}`,
      age: Math.floor(Math.random() * 80) + 1,
      gender: genders[Math.floor(Math.random() * 3)],
      contact: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      district: districts[Math.floor(Math.random() * districts.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      abha_id: `ABHA-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (patients.length >= 100) {
      const { error } = await supabase.from('patients').insert(patients);
      if (error) console.error('Error batch inserting:', error);
      patients.length = 0;
      console.log(`✅ Inserted ${i + 1} records...`);
    }
  }

  console.log('✨ Seeding complete!');
}

seedData(1000);
