async function testLogin() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '123456' }),
    });
    console.log('Status:', res.status);
    console.log('Headers:', res.headers);
    const data = await res.text();
    console.log('Body:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}
testLogin();
