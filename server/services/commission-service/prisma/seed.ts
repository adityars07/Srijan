import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Commission Service Database Seeding...');

  // Clean existing records
  await prisma.customCommission.deleteMany();
  await prisma.contactMessage.deleteMany();

  // 1. Seed Sample Bespoke Commission
  await prisma.customCommission.create({
    data: {
      name: 'Pooja Verma',
      email: 'pooja.verma@example.com',
      phone: '+91 9811223344',
      category: 'Resin Art',
      occasion: 'Wedding Anniversary',
      budgetRange: '₹5,000 - ₹8,000',
      description: 'Preservation of wedding varmala roses with 24K gold foil and custom date engraving (24th Nov 2025).',
      status: 'QUOTE_SENT',
      quoteAmountINR: 6500,
      adminNotes: 'Discussed flower drying timeline with client. Client approved resin layout mockup.',
    },
  });

  // 2. Seed Sample Contact Message
  await prisma.contactMessage.create({
    data: {
      name: 'Dr. Ananya Roy',
      email: 'ananya.roy@example.com',
      phone: '+91 9822334455',
      message: 'Hello Srijan team, we are planning corporate festival gift hampers of handcrafted crochet flowers and ceramic mugs for 40 executives. Could you please share bulk commission timelines?',
      isRead: false,
    },
  });

  console.log('🎨 Seeded Sample Bespoke Commission & Inquiries');
}

main()
  .catch((e) => {
    console.error('❌ Error during commission seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
