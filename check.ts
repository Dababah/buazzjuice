import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany();
  console.log('Users:', users);
  const attempts = await prisma.loginAttempt.findMany();
  console.log('Login Attempts:', attempts);
  
  // Clear any locks
  await prisma.loginAttempt.deleteMany();
  console.log('Cleared all login attempts');
}

run().finally(() => prisma.$disconnect());
