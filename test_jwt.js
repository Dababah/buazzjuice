const jwt = require('jsonwebtoken');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJBZG1pbiBCVUFaWloiLCJpYXQiOjE3ODI4MjIzMzksImV4cCI6MTc4Mjg2NTUzOX0.oUqBShuHTrsV8vvePaZb46_yGRWB_Kqf0fhT4AB9cs8";
const secret = "ganti_dengan_random_string_yang_sangat_panjang_dan_aman_minimal_32_karakter";

try {
  console.log('Result:', jwt.verify(token, secret));
} catch (e) {
  console.error('Error:', e.message);
}
