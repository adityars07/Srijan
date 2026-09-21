import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Order Service Database Seeding...');

  // Clean existing records
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();

  // 1. Seed Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'SRIJAN10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 1000,
        maxDiscount: 500,
        isActive: true,
      },
      {
        code: 'WELCOME15',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minOrderValue: 1500,
        maxDiscount: 1000,
        isActive: true,
      },
      {
        code: 'RAKHI500',
        discountType: 'FIXED',
        discountValue: 500,
        minOrderValue: 3000,
        isActive: true,
      },
    ],
  });

  console.log('🎟️ Seeded Active Coupons: SRIJAN10, WELCOME15, RAKHI500');

  // 2. Seed Sample Live Order
  await prisma.order.create({
    data: {
      orderNumber: 'SRJ-2026-1001',
      guestName: 'Aditya Kumar',
      guestEmail: 'demo@srijan.com',
      guestPhone: '+91 9876543210',
      subtotal: 1850,
      discountAmount: 185,
      shippingCost: 0,
      totalAmount: 1665,
      currency: 'INR',
      status: 'IN_CRAFTING',
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      shippingAddress: JSON.stringify({
        firstName: 'Aditya',
        lastName: 'Kumar',
        street: 'Sector 42, Golf Course Road',
        apartment: 'Villa 14B',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122002',
        country: 'India',
        phone: '+91 9876543210',
      }),
      trackingNumber: 'DELHIVERY-984210',
      notes: 'Handcrafted with personalized note for anniversary gift.',
      items: {
        create: {
          productId: 'seed-crochet-bouquet-01',
          productName: 'Handcrafted Crochet Floral Bouquet - Sunflower & Blooms',
          productImage: '/images/crochet-artisan-floral-bouquet.jpg',
          colorName: 'Sunflower Sunshine & Daisy',
          sizeName: 'Deluxe Bouquet (7 Stems)',
          unitPrice: 1850,
          quantity: 1,
          totalPrice: 1850,
        },
      },
    },
  });

  console.log('🛍️ Seeded Sample Order SRJ-2026-1001');
}

main()
  .catch((e) => {
    console.error('❌ Error during order seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
