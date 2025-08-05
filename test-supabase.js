// Quick test script to verify Supabase connection
// Run with: node test-supabase.js

require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('\n❌ Please set your Supabase environment variables in .env.local');
    return;
  }
  
  try {
    // Try to import and test Supabase
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log('\n🔗 Testing database connection...');
    
    // Test connection by querying users table
    const { data, error } = await supabase
      .from('utilisateurs')
      .select('email, nom, prenom, role')
      .limit(1);
    
    if (error) {
      console.log('❌ Database Error:', error.message);
      console.log('\n💡 Make sure you have:');
      console.log('   1. Run the SQL schema in Supabase');
      console.log('   2. Enabled RLS policies');
      console.log('   3. Set correct environment variables');
    } else {
      console.log('✅ Database connection successful!');
      console.log('📊 Sample data:', data);
      
      if (data.length > 0) {
        console.log('\n🎉 Setup is complete! You can now:');
        console.log('   • Run: npm run dev');
        console.log('   • Login with: admin@store.com / admin123');
      }
    }
    
  } catch (importError) {
    console.log('❌ Import Error:', importError.message);
    console.log('💡 Run: npm install @supabase/supabase-js');
  }
}

testSupabaseConnection();