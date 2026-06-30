const cookie = 'buazzz_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJBZG1pbiBCVUFaWloiLCJpYXQiOjE3ODI4MjIzMzksImV4cCI6MTc4Mjg2NTUzOX0.oUqBShuHTrsV8vvePaZb46_yGRWB_Kqf0fhT4AB9cs8';

async function testDashboard() {
  try {
    const res = await fetch('http://localhost:3000/admin/dashboard', {
      headers: {
        'Cookie': cookie
      },
      redirect: 'manual'
    });
    console.log('Status:', res.status);
    console.log('Headers:', res.headers);
    const data = await res.text();
    console.log('Body snippet:', data.slice(0, 100));
  } catch (error) {
    console.error('Error:', error);
  }
}
testDashboard();
