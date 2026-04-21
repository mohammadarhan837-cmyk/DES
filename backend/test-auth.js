async function testAuth() {
  const email = `test_${Date.now()}@example.com`;
  const password = 'Password123!';
  const name = 'Test User';
  const role = 'client';

  try {
    console.log('--- Testing Registration ---');
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const regData = await regRes.json();
    console.log('Registration Response:', regData);

    console.log('\n--- Testing Login (Unverified) ---');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    const loginData = await loginRes.json();
    console.log('Login (Unverified) Response:', loginData);

  } catch (error) {
    console.error('Test Failed:', error.message);
  }
}

testAuth();
