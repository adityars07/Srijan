// End-to-end verification script for Srijan Microservices Architecture & API Gateway

async function runTests() {
  console.log('🧪 Starting End-to-End Microservices Verification...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Gateway Health Check (aggregates all 4 services)
  await test('Gateway Health (all 4 services online)', async () => {
    const res = await fetch('http://localhost:5000/api/health');
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'healthy') throw new Error(`Gateway status: ${data.status}`);
    if (data.services.auth.status !== 'online') throw new Error('Auth offline');
    if (data.services.product.status !== 'online') throw new Error('Product offline');
    if (data.services.order.status !== 'online') throw new Error('Order offline');
    if (data.services.commission.status !== 'online') throw new Error('Commission offline');
  });

  // 2. Gateway Admin Metrics Aggregator
  await test('Gateway Metrics Aggregator (/api/admin/metrics)', async () => {
    const res = await fetch('http://localhost:5000/api/admin/metrics');
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.metrics.totalProducts !== 22) throw new Error(`Expected 22 products, got ${data.metrics.totalProducts}`);
    if (data.metrics.totalOrders < 1) throw new Error('Expected at least 1 order');
    if (data.metrics.totalRevenue < 1000) throw new Error('Expected revenue > 1000');
  });

  // 3. Product Service through Gateway (/api/products)
  await test('Product Service: List Products (/api/products)', async () => {
    const res = await fetch('http://localhost:5000/api/products');
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.total !== 22) throw new Error(`Expected total 22, got ${data.total}`);
    if (!data.products || data.products.length !== 22) throw new Error('Product list invalid');
    const first = data.products[0];
    if (!first.name || !first.priceINR || !first.image) throw new Error('Product missing core attributes');
  });

  // 4. Product Service: Single Product by Slug (/api/products/:slug)
  await test('Product Service: Single Product (/api/products/crochet-artisan-floral-bouquet)', async () => {
    const res = await fetch('http://localhost:5000/api/products/crochet-artisan-floral-bouquet');
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.product || data.product.slug !== 'crochet-artisan-floral-bouquet') {
      throw new Error('Product slug mismatch');
    }
    if (!data.product.colors || data.product.colors.length === 0) throw new Error('Product colors missing');
    if (!data.product.sizes || data.product.sizes.length === 0) throw new Error('Product sizes missing');
  });

  // 5. Auth Service: Login (/api/auth/login)
  let authToken = '';
  await test('Auth Service: Login Patrons & Admin (/api/auth/login)', async () => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@srijan.com', password: 'Customer2026!' }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.token) throw new Error('Missing token in response');
    authToken = data.token;
  });

  // 6. Order Service: Validate Coupon (/api/coupons/validate)
  await test('Order Service: Validate Coupon (/api/coupons/validate)', async () => {
    const res = await fetch('http://localhost:5000/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'SRIJAN10', subtotal: 2000 }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.valid || data.coupon.discountAmount !== 200) {
      throw new Error(`Expected 200 discount, got ${data.coupon?.discountAmount}`);
    }
  });

  // 7. Order Service: Track Live Order (/api/orders/track/DELHIVERY-984210)
  await test('Order Service: Track Order (/api/orders/track/DELHIVERY-984210)', async () => {
    const res = await fetch('http://localhost:5000/api/orders/track/DELHIVERY-984210');
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.order || data.order.trackingNumber !== 'DELHIVERY-984210') {
      throw new Error('Order tracking number mismatch');
    }
    if (!data.order.items || data.order.items.length === 0) throw new Error('Order items missing');
  });

  // 8. Commission Service: List Custom Requests (/api/custom-requests)
  await test('Commission Service: Custom Requests (/api/custom-requests)', async () => {
    const res = await fetch('http://localhost:5000/api/custom-requests');
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.total < 1 || !data.requests) throw new Error('No custom requests returned');
  });

  // 9. Commission Service: Submit Contact Inquiry (/api/contact)
  await test('Commission Service: Submit Contact Inquiry (/api/contact)', async () => {
    const res = await fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Tester',
        email: 'tester@srijan.com',
        phone: '+91 9999888877',
        message: 'Microservice integration test message.',
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.contact || !data.contact.id) throw new Error('Contact creation failed');
  });

  // 10. Inter-Service Order Creation + Stock Decrement Test
  await test('Inter-Service: Place Order & Auto Decrement Stock', async () => {
    // 1. Get initial stock of a product
    const prodRes = await fetch('http://localhost:5000/api/products/crochet-artisan-floral-bouquet');
    const prodData = await prodRes.json();
    const initialStock = prodData.product.stockQuantity;

    // 2. Place order for 2 units
    const orderRes = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            productId: prodData.product.id,
            productName: prodData.product.name,
            productImage: prodData.product.image,
            unitPrice: prodData.product.priceINR,
            quantity: 2,
          },
        ],
        couponCode: 'SRIJAN10',
        shippingAddress: {
          firstName: 'Aditya',
          lastName: 'Tester',
          city: 'Gurugram',
          state: 'Haryana',
          postalCode: '122002',
        },
      }),
    });

    if (!orderRes.ok) {
      const err = await orderRes.json();
      throw new Error(`Order placement failed: ${err.error || orderRes.status}`);
    }

    const orderData = await orderRes.json();
    if (!orderData.order || !orderData.order.orderNumber) {
      throw new Error('Order number missing in created order');
    }

    // 3. Verify stock decremented by 2
    const verifyProdRes = await fetch('http://localhost:5000/api/products/crochet-artisan-floral-bouquet');
    const verifyProdData = await verifyProdRes.json();
    if (verifyProdData.product.stockQuantity !== initialStock - 2) {
      throw new Error(`Expected stock ${initialStock - 2}, got ${verifyProdData.product.stockQuantity}`);
    }
  });

  console.log(`\n========================================`);
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
