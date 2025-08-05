// Debug script to test authentication
// Run with: node debug-auth.js

require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');

async function debugAuth() {
  console.log('🔍 Debugging Authentication System...\n');
  
  // Test password hashing
  console.log('🔐 Testing Password Hashing:');
  const testPassword = 'admin123';
  const hash1 = await bcrypt.hash(testPassword, 10);
  const hash2 = '$2b$10$K.S.T.0wP8qL5Q9J5qZ5JOJ5qZ5J9eJ5qZ5J9eJ5qZ5J9eJ5qZ5Je';
  
  console.log('Original password:', testPassword);
  console.log('Generated hash:', hash1);
  console.log('Database hash:', hash2);
  
  const isValid1 = await bcrypt.compare(testPassword, hash1);
  const isValid2 = await bcrypt.compare(testPassword, hash2);
  
  console.log('New hash validates:', isValid1 ? '✅' : '❌');
  console.log('DB hash validates:', isValid2 ? '✅' : '❌');
  
  // Generate correct hash for database
  console.log('\n📝 Correct hash for database:');
  const correctHash = await bcrypt.hash('admin123', 10);
  console.log(correctHash);
  
  // Test environment variables
  console.log('\n🌍 Environment Variables:');
  console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('\n❌ Please create .env.local with your Supabase credentials');
    return;
  }
  
  // Test database connection
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log('\n🔍 Testing Database Query:');
    const { data, error } = await supabase
      .from('utilisateurs')
      .select('*')
      .eq('email', 'admin@store.com');
    
    if (error) {
      console.log('❌ Database error:', error.message);
      console.log('💡 Possible issues:');
      console.log('   • Table "utilisateurs" doesn\'t exist');
      console.log('   • RLS policies blocking access');
      console.log('   • Wrong Supabase credentials');
    } else {
      console.log('✅ Query successful');
      console.log('📊 User data:', data);
      
      if (data.length === 0) {
        console.log('⚠️  No admin user found in database');
        console.log('💡 You need to insert the admin user');
      } else {
        const user = data[0];
        console.log('\n🔐 Testing password against DB hash:');
        const isPasswordValid = await bcrypt.compare('admin123', user.password_hash);
        console.log('Password validation:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
        
        if (!isPasswordValid) {
          console.log('\n🔧 Fixing password hash...');
          console.log('Run this SQL in Supabase:');
          console.log(`UPDATE utilisateurs SET password_hash = '${correctHash}' WHERE email = 'admin@store.com';`);
        }
      }
    }
    
  } catch (err) {
    console.log('❌ Connection error:', err.message);
  }
}

debugAuth().catch(console.error);