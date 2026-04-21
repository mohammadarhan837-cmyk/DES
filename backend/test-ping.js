async function testPing() {
  try {
    const res = await fetch('http://localhost:5000/api/ping');
    console.log('Ping Status:', res.status);
    const data = await res.json();
    console.log('Ping Data:', data);
  } catch (err) {
    console.log('Error:', err.message);
  }
}
testPing();
