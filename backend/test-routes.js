async function testRoutes() {
  try {
    console.log('Testing Nonce Route...');
    const res1 = await fetch('http://localhost:5000/api/auth/nonce/0x0000000000000000000000000000000000000000');
    console.log('Nonce Route Status:', res1.status);

    console.log('Testing Link-Wallet Route...');
    const res2 = await fetch('http://localhost:5000/api/auth/link-wallet', { method: 'POST' });
    console.log('Link-Wallet Route Status:', res2.status);
    
    if (res2.status === 404) {
      console.log('❌ ERROR: Route NOT found (404)');
    } else if (res2.status === 401) {
      console.log('✅ SUCCESS: Route exists (401 Unauthorized is expected without token)');
    } else {
      console.log('Route returned status:', res2.status);
    }
  } catch (err) {
    console.log('❌ Server Connection Error:', err.message);
  }
}

testRoutes();
