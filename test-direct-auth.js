// Test authentication bypass RLS
require('dotenv').config({ path: '.env.local' });

async function testDirectAuth() {
  console.log('🔍 Testing Direct Authentication (bypassing RLS)...\n');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    // Use service role key to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // This bypasses RLS
    );
    
    console.log('🔑 Using Service Role Key to bypass RLS...');
    
    // Test with admin client
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('utilisateurs')
      .select('*')
      .eq('email', 'admin@store.com');
    
    if (adminError) {
      console.log('❌ Admin query error:', adminError.message);
    } else {
      console.log('✅ Admin query successful');
      console.log('📊 User data:', adminData);
      
      if (adminData.length > 0) {
        const user = adminData[0];
        console.log('\n🔐 Testing password validation:');
        
        const bcrypt = require('bcryptjs');
        const isValid = await bcrypt.compare('admin123', user.password_hash);
        console.log('Password check:', isValid ? '✅ Valid' : '❌ Invalid');
        
        if (!isValid) {
          console.log('\n🔧 Password hash mismatch detected!');
          console.log('DB Hash:', user.password_hash);
          
          // Generate new correct hash
          const newHash = await bcrypt.hash('admin123', 10);
          console.log('New Hash:', newHash);
          
          console.log('\n📝 Run this SQL to fix the password:');
          console.log(`UPDATE utilisateurs SET password_hash = '${newHash}' WHERE email = 'admin@store.com';`);
        }
      }
    }
    
    // Also test with regular anon key
    console.log('\n🔍 Testing with Anon Key (should fail due to RLS):');
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('utilisateurs')
      .select('*')
      .eq('email', 'admin@store.com');
    
    if (anonError) {
      console.log('❌ Anon query error (expected):', anonError.message);
    } else {
      console.log('✅ Anon query result:', anonData);
    }
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

testDirectAuth();