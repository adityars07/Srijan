import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Auth Service DB (auth.db)...');

  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  const adminPasswordHash = await bcrypt.hash('ArtisanRakhi2026!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@srijan.com',
      name: 'Rakhi Karn',
      phone: '+91 9711881512',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  console.log(`✅ Auth DB Seeded: Admin (${admin.email})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
