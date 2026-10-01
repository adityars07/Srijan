import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Srijan Database Seeding...');

  // 1. Clean existing records
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productColor.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customCommission.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  const adminPasswordHash = await bcrypt.hash('ArtisanRakhi2026!', 10);
  const customerPasswordHash = await bcrypt.hash('Customer2026!', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@srijan.com',
      name: 'Rakhi Karn',
      phone: '+91 9711881512',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: 'demo@srijan.com',
      name: 'Aditya Kumar',
      phone: '+91 9876543210',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      addresses: {
        create: {
          street: 'Sector 42, Golf Course Road',
          apartment: 'Villa 14B',
          city: 'Gurugram',
          state: 'Haryana',
          postalCode: '122002',
          country: 'India',
          isDefault: true,
        },
      },
    },
  });

  console.log(`👤 Created Users: Admin (${adminUser.email}), Customer (${customerUser.email})`);

  // 3. Seed Products
  const productsData = [
    {
      slug: 'crochet-artisan-floral-bouquet',
      name: 'Handcrafted Crochet Floral Bouquet - Sunflower & Blooms',
      category: 'Crochet',
      collection: 'Boho Blooms',
      priceINR: 1850,
      priceUSD: 23,
      originalPriceINR: 2200,
      originalPriceUSD: 28,
      rating: 5.0,
      reviewCount: 42,
      description: 'An everlasting artisanal bouquet meticulously hand-crocheted with premium milk cotton yarn. Features vibrant blooming sunflowers, white daisies, lavender sprigs, rose buds, and eucalyptus foliage, elegantly wrapped in artisan kraft paper and tied with a satin ribbon.',
      storySnippet: 'Hand-looped stitch by stitch by Rakhi over 12 hours of dedicated artisanal craft.',
      material: 'Premium Milk Cotton Yarn, Floral Stems, Kraft Wrap, Satin Ribbon',
      inStock: true,
      stockQuantity: 15,
      sku: 'SRJ-CR-01',
      dimensions: 'Height 38 cm × Width 22 cm',
      careInstructions: 'Gently dust with a soft brush or light cool airflow. Keep away from excessive moisture to preserve petal stiffness.',
      deliveryInfo: 'Crafted on order. Dispatched in 2-3 business days in reinforced eco-friendly cylindrical packaging.',
      isTrending: true,
      isFeatured: true,
      badge: 'Bestseller',
      images: ['/images/crochet-artisan-floral-bouquet.jpg'],
      colors: [
        { name: 'Sunflower Sunshine & Daisy', hex: '#F4C430' },
        { name: 'Blush Rose & Lavender', hex: '#D4A5A5' },
        { name: 'Ivory Meadow Cream', hex: '#FAF3E0' },
      ],
      sizes: ['Deluxe Bouquet (7 Stems)', 'Grand Signature (12 Stems)'],
    },
    {
      slug: 'crochet-sunflower-tote-crossbody',
      name: 'Artisan Sunflower Granny Square Tote & Crossbody Bag',
      category: 'Crochet',
      collection: 'Boho Blooms',
      priceINR: 2450,
      priceUSD: 30,
      originalPriceINR: 2850,
      originalPriceUSD: 35,
      rating: 4.9,
      reviewCount: 36,
      description: 'Bohemian heirloom statement bag handcrafted from individual crocheted sunflower granny squares with a rich chocolate and oatmeal frame. Features sturdy braided handles, an adjustable crossbody shoulder strap, and an accompanying mini zipper coin charm.',
      storySnippet: 'Each square is individually hand-joined, creating a durable yet supple textile structure.',
      material: '100% Breathable Cotton Yarn, Reinforced Cotton Inner Lining',
      inStock: true,
      stockQuantity: 12,
      sku: 'SRJ-CR-02',
      dimensions: '34 cm × 32 cm with 55 cm drop strap',
      careInstructions: 'Hand wash gently in cold water with mild detergent. Reshape and dry flat in shade.',
      deliveryInfo: 'Made with love on order. Ships within 3-4 working days.',
      isTrending: true,
      isFeatured: true,
      badge: 'Artisan Signature',
      images: ['/images/crochet-sunflower-tote-crossbody.jpg'],
      colors: [
        { name: 'Harvest Sunflower Ochre', hex: '#C87D55' },
        { name: 'Meadow Daisy Ivory', hex: '#FAF3E0' },
        { name: 'Espresso Earth', hex: '#4A3B32' },
      ],
      sizes: ['Medium Tote (34 × 32 cm)', 'Large Oversized (40 × 38 cm)'],
    },
    {
      slug: 'crochet-mandala-dreamcatcher-lavender',
      name: 'Serenity Lavender Mandala Crochet Dreamcatcher',
      category: 'Crochet',
      collection: 'Boho Blooms',
      priceINR: 1650,
      priceUSD: 21,
      originalPriceINR: 1950,
      originalPriceUSD: 25,
      rating: 5.0,
      reviewCount: 28,
      description: 'A mesmerizing circular wall art dreamcatcher inspired by sacred geometry. Hand-knotted with delicate lilac, lavender, and periwinkle yarns stretched across an embroidered hoop, adorned with hand-crocheted feathers, hanging leaves, and lustrous pearl beads.',
      storySnippet: 'Brings peaceful energy, calm vibrations, and whimsical texture to bedrooms and creative studios.',
      material: 'Mercerized Cotton Thread, Wooden Hoop, Pearl Beads, Feathers',
      inStock: true,
      stockQuantity: 20,
      sku: 'SRJ-CR-03',
      dimensions: 'Hoop Diameter 22 cm, Total Hanging Length 60 cm',
      careInstructions: 'Hang freely. Lightly comb crochet fringe with fingers if ruffled during unboxing.',
      deliveryInfo: 'Ships in protective flat-box casing within 48 hours.',
      isTrending: true,
      isFeatured: true,
      badge: 'New Launch',
      images: ['/images/crochet-mandala-dreamcatcher-lavender.jpg'],
      colors: [
        { name: 'Lavender & Lilac Mist', hex: '#B399D4' },
        { name: 'Ivory Pearl Moon', hex: '#FAF3E0' },
        { name: 'Periwinkle Dream', hex: '#7D8CC4' },
      ],
      sizes: ['Diameter 22 cm', 'Diameter 30 cm'],
    },
    {
      slug: 'crochet-mandala-dreamcatcher-emerald',
      name: 'Forest Emerald Mandala Crochet Wall Hanging',
      category: 'Crochet',
      collection: 'Boho Blooms',
      priceINR: 1750,
      priceUSD: 22,
      originalPriceINR: 2100,
      originalPriceUSD: 26,
      rating: 4.9,
      reviewCount: 24,
      description: 'Rich jewel-toned wall tapestry dreamcatcher crafted with concentric mandala loops in deep forest emerald, jade, and mint greens. Accented with natural wooden beads and hand-crocheted trailing leaf pennants.',
      storySnippet: 'Inspired by the sacred evergreen groves of the Nilgiri hills.',
      material: 'Premium Dyed Cotton Yarn, Lightweight Hoop Frame, Wood Beads',
      inStock: true,
      stockQuantity: 18,
      sku: 'SRJ-CR-04',
      dimensions: 'Hoop Diameter 25 cm, Total Hanging Length 65 cm',
      careInstructions: 'Gently dust with a feather duster. Suitable for indoor spaces away from prolonged rain.',
      deliveryInfo: 'Dispatched within 2-3 business days in reinforced mailer.',
      isTrending: true,
      isFeatured: false,
      badge: 'Staff Pick',
      images: ['/images/crochet-mandala-dreamcatcher-emerald.jpg'],
      colors: [
        { name: 'Deep Emerald & Jade', hex: '#2A5D44' },
        { name: 'Mint Sage Accent', hex: '#87A987' },
        { name: 'Earthy Teal', hex: '#3B7A75' },
      ],
      sizes: ['Diameter 25 cm', 'Diameter 35 cm'],
    },
    {
      slug: 'crochet-potted-sunflowers',
      name: 'Twin Blooming Crochet Sunflowers Desk Decor',
      category: 'Crochet',
      collection: 'Boho Blooms',
      priceINR: 1200,
      priceUSD: 16,
      originalPriceINR: 1450,
      originalPriceUSD: 19,
      rating: 5.0,
      reviewCount: 39,
      description: 'Perpetual sunshine for your study table or bookshelf. Pair of lovingly hand-knitted miniature sunflower blooms emerging from realistic textured brown soil in soft terracotta-tone crochet pots with bendable wired green stems.',
      storySnippet: 'No watering required, ever-blooming warmth that sparks instant joy.',
      material: 'Milk Cotton Yarn, Internal Flexible Wire Armature, Soft Fiberfill',
      inStock: true,
      stockQuantity: 30,
      sku: 'SRJ-CR-05',
      dimensions: 'Height 16 cm each × Pot Base 7 cm',
      careInstructions: 'Bend flower heads to your desired angle. Dust lightly with a dry paintbrush.',
      deliveryInfo: 'Ships securely packed in eco-cylinder within 2 business days.',
      isTrending: true,
      isFeatured: true,
      badge: 'Joyful Gift',
      images: ['/images/crochet-potted-sunflowers.jpg'],
      colors: [
        { name: 'Golden Sun & Terracotta', hex: '#F39C12' },
        { name: 'Warm Amber & Ochre', hex: '#D35400' },
      ],
      sizes: ['Set of 2 Pots', 'Single Statement Pot'],
    },
    {
      slug: 'crochet-evil-eye-flower-stems',
      name: 'Nazar Suraksha Evil Eye Crochet Flower Stems',
      category: 'Crochet',
      collection: 'Signature Srijan',
      priceINR: 950,
      priceUSD: 13,
      originalPriceINR: 1200,
      originalPriceUSD: 16,
      rating: 4.9,
      reviewCount: 31,
      description: 'A harmonious blend of cultural protection and botanical artistry. Features vibrant blue, turquoise, white, and black evil eye concentric centers blossoming into sculpted sunflower and daisy petals on sturdy display stems.',
      storySnippet: 'Designed to ward off negative vibrations while elevating your entry foyer or living space.',
      material: 'High-grade Cotton Yarn, Reinforced Steel Floral Wire Stems',
      inStock: true,
      stockQuantity: 25,
      sku: 'SRJ-CR-06',
      dimensions: 'Stem Length 32 cm, Bloom Diameter 9 cm',
      careInstructions: 'Arrange into ceramic or glass vases. Stems can be trimmed or bent to match vase height.',
      deliveryInfo: 'Handmade on order. Ships within 3 days.',
      isTrending: true,
      isFeatured: false,
      badge: 'Protection Charm',
      images: ['/images/crochet-evil-eye-flower-stems.jpg'],
      colors: [
        { name: 'Cobalt Evil Eye & Yellow', hex: '#1E3799' },
        { name: 'Turquoise & White Petals', hex: '#00A8FF' },
      ],
      sizes: ['Trio Set (3 Stems)', 'Solo Protective Stem'],
    },
    {
      slug: 'crochet-eyewear-sleeve-case',
      name: 'Textured Lilac & Cream Crochet Eyewear Sleeve Case',
      category: 'Crochet',
      collection: 'Boho Blooms',
      priceINR: 650,
      priceUSD: 9,
      originalPriceINR: 800,
      originalPriceUSD: 11,
      rating: 4.8,
      reviewCount: 27,
      description: 'Keep your spectacles and sunglasses scratch-free in style. Meticulously crocheted using thick cushion-stitch ribbing in soft lilac and ivory tones, fastened with a handcrafted engraved wooden toggle button and loop closure.',
      storySnippet: 'Soft, cushioned, shock-absorbing protection that slips smoothly into any handbag or pocket.',
      material: 'Soft Combed Cotton Yarn, Natural Wood Toggle Button',
      inStock: true,
      stockQuantity: 40,
      sku: 'SRJ-CR-07',
      dimensions: '18 cm × 9 cm',
      careInstructions: 'Spot clean with mild damp cloth. Air dry flat.',
      deliveryInfo: 'Dispatched within 24-48 hours in reusable fabric pouch.',
      isTrending: true,
      isFeatured: false,
      badge: 'Bestseller',
      images: ['/images/crochet-eyewear-sleeve-case.jpg'],
      colors: [
        { name: 'Lilac & Almond Cream', hex: '#C3B1E1' },
        { name: 'Sage Green & Oat', hex: '#A8BBA2' },
        { name: 'Warm Terracotta', hex: '#C97D60' },
      ],
      sizes: ['Standard Fit (Fits 95% Eyewear)', 'Oversized Sunglasses Fit'],
    },
    {
      slug: 'crochet-purple-drawstring-pouch',
      name: 'Woven Shell-Stitch Crochet Drawstring Potli Pouch',
      category: 'Crochet',
      collection: 'Boho Blooms',
      priceINR: 850,
      priceUSD: 11,
      originalPriceINR: 1050,
      originalPriceUSD: 14,
      rating: 5.0,
      reviewCount: 22,
      description: 'An elegant vintage-inspired drawstring bucket pouch in dual-tone violet and lilac. Features an intricate wave shell stitch pattern, reinforced circular base, and woven drawstring cords finished with dainty crochet flower beads.',
      storySnippet: 'Perfect for festive occasions, carrying cosmetics, coins, jewelry, or essential treasures.',
      material: 'Double-ply Mercerized Cotton Yarn, Braided Drawstring Ties',
      inStock: true,
      stockQuantity: 20,
      sku: 'SRJ-CR-08',
      dimensions: 'Height 16 cm × Base 14 cm',
      careInstructions: 'Hand wash gently. Hang dry away from direct scorching sun.',
      deliveryInfo: 'Dispatched in 2-3 business days.',
      isTrending: false,
      isFeatured: false,
      badge: 'Festive Pick',
      images: ['/images/crochet-purple-drawstring-pouch.jpg'],
      colors: [
        { name: 'Violet & Lilac Ombre', hex: '#8A4F7D' },
        { name: 'Golden Honey & Cream', hex: '#E6A15C' },
      ],
      sizes: ['Compact Potli (16 × 14 cm)', 'Medium Clutch (22 × 18 cm)'],
    },
    {
      slug: 'crochet-ruffled-scrunchies-set',
      name: 'Luxury Hand-Crocheted Ruffled Scrunchies (Pack of 3)',
      category: 'Crochet',
      collection: 'Boho Blooms',
      priceINR: 550,
      priceUSD: 7,
      originalPriceINR: 700,
      originalPriceUSD: 9,
      rating: 4.9,
      reviewCount: 45,
      description: 'Treat your hair to ultimate gentle care. Set of 3 voluptuous ruffled scrunchies crocheted around strong, snag-free elastic bands in curated pastel hues: Cloud White, Petal Blush, and Warm Nude.',
      storySnippet: 'Eliminates hair creasing and breakage while making high ponytails and messy buns look effortlessly chic.',
      material: 'Ultra-soft Milk Cotton Yarn, Non-snag Seamless Rubber Elastic',
      inStock: true,
      stockQuantity: 50,
      sku: 'SRJ-CR-09',
      dimensions: 'Outer Diameter approx. 12 cm each with generous volume',
      careInstructions: 'Gentle hand wash with hair shampoo or mild soap. Air dry flat.',
      deliveryInfo: 'Ready to ship within 24 hours.',
      isTrending: true,
      isFeatured: false,
      badge: 'Must-Have',
      images: ['/images/crochet-ruffled-scrunchies-set.jpg'],
      colors: [
        { name: 'Pastel Trio (White, Blush, Cream)', hex: '#F7D8D5' },
        { name: 'Earthy Trio (Ochre, Sage, Clay)', hex: '#C2A385' },
      ],
      sizes: ['Pack of 3', 'Pack of 5'],
    },
    {
      slug: 'crochet-flower-basket-magnet',
      name: 'Mini Blossom Basket Fridge Magnet & Desk Charm',
      category: 'Crochet',
      collection: 'Boho Blooms',
      priceINR: 450,
      priceUSD: 6,
      originalPriceINR: 550,
      originalPriceUSD: 8,
      rating: 4.9,
      reviewCount: 33,
      description: 'An irresistible miniature woven basket overflowing with hand-stitched micro roses, daisies, and foliage. Fitted with a heavy-duty neodymium magnet on the back that clings firmly to refrigerators, magnet boards, or steel workstations.',
      storySnippet: 'Spreads sunshine and artisanal warmth across everyday kitchen spaces.',
      material: 'Fine Cotton Embroidery Floss, Neodymium Strong Magnet',
      inStock: true,
      stockQuantity: 35,
      sku: 'SRJ-CR-10',
      dimensions: 'Height 7 cm × Width 5.5 cm',
      careInstructions: 'Spot wipe with dry cotton cloth. Do not soak magnet.',
      deliveryInfo: 'Packed in miniature kraft gift box. Ships in 24 hours.',
      isTrending: false,
      isFeatured: false,
      badge: 'Gift Favorite',
      images: ['/images/crochet-flower-basket-magnet.jpg'],
      colors: [
        { name: 'Wicker Straw & Pastel Roses', hex: '#D2B48C' },
        { name: 'Cream Basket & Sunflowers', hex: '#FFFDD0' },
      ],
      sizes: ['Single Mini Basket', 'Set of 2 Magnets'],
    },
    {
      slug: 'crochet-daisy-keychains-pair',
      name: 'Sunshine Daisy & Tulip Beaded Keychains (Pair)',
      category: 'Crochet',
      collection: 'Boho Blooms',
      priceINR: 490,
      priceUSD: 7,
      originalPriceINR: 650,
      originalPriceUSD: 9,
      rating: 4.8,
      reviewCount: 29,
      description: 'Set of two cheerful floral keychains featuring hand-knitted 3D daisies and tulips with dangling wooden beads and sturdy metallic lobster clasps. Easily attaches to car keys, backpacks, or tote handles.',
      storySnippet: 'A delightful companion piece for everyday keys and accessories.',
      material: 'Cotton Thread, Natural Pastel Wooden Beads, Gold Metal Clasp',
      inStock: true,
      stockQuantity: 40,
      sku: 'SRJ-CR-11',
      dimensions: 'Length 14 cm each including clasp',
      careInstructions: 'Spot clean. Keep metal clasp dry.',
      deliveryInfo: 'Ships in 24-48 hours.',
      isTrending: false,
      isFeatured: false,
      badge: 'Cute Find',
      images: ['/images/crochet-daisy-keychains-pair.jpg'],
      colors: [
        { name: 'Daisy Yellow & Tulip Pink', hex: '#F1C40F' },
        { name: 'Lavender & Cream Trio', hex: '#C3B1E1' },
      ],
      sizes: ['Pair of 2 Charms'],
    },
    {
      slug: 'crochet-eyeglass-bow-charms',
      name: 'Pastel Bow & Floral Accessory Charms (Pair)',
      category: 'Crochet',
      collection: 'Boho Blooms',
      priceINR: 390,
      priceUSD: 5,
      originalPriceINR: 500,
      originalPriceUSD: 7,
      rating: 4.7,
      reviewCount: 18,
      description: 'Delicate hand-looped pastel bows and floral accents designed to clip onto glasses chains, pouch zippers, headphone cases, or bag straps for an instant coquettish artisanal touch.',
      storySnippet: 'Handcrafted in Rakhi’s studio with fine lace-weight yarn.',
      material: 'Lace Cotton Yarn, Secure Clip Attachment',
      inStock: true,
      stockQuantity: 30,
      sku: 'SRJ-CR-12',
      dimensions: 'Length 9 cm each',
      careInstructions: 'Spot clean with dry cloth.',
      deliveryInfo: 'Ready to ship.',
      isTrending: false,
      isFeatured: false,
      badge: 'Pocket Charm',
      images: ['/images/crochet-eyeglass-bow-charms.jpg'],
      colors: [
        { name: 'Rose Quartz & Blush', hex: '#F3C5C5' },
        { name: 'Vanilla & Mint', hex: '#E8F5E9' },
      ],
      sizes: ['Pair of 2 Accents'],
    },
    {
      slug: 'crochet-sunflower-car-hanging',
      name: 'Dual-Bloom Sunflower Mirror Charm & Car Hanging',
      category: 'Crochet',
      collection: 'Boho Blooms',
      priceINR: 620,
      priceUSD: 8,
      originalPriceINR: 750,
      originalPriceUSD: 10,
      rating: 4.9,
      reviewCount: 34,
      description: 'Brighten every morning drive. Handcrafted double-sided blooming sunflower charm suspended by braided macrame cord with leafy foliage and a boho tassel tail. Ties effortlessly around any rearview car mirror or window frame.',
      storySnippet: 'Brings calm vibes, radiant color, and artisanal sunshine on every journey.',
      material: 'Colorfast Cotton Yarn, Wooden Bead, Braided Hanging Loop',
      inStock: true,
      stockQuantity: 35,
      sku: 'SRJ-CR-13',
      dimensions: 'Bloom 9 cm × 9 cm, Total Drop 24 cm',
      careInstructions: 'Ties easily with adjustable knot. Resists fading under sunlit windshields.',
      deliveryInfo: 'Ships within 48 hours.',
      isTrending: true,
      isFeatured: false,
      badge: 'Popular',
      images: ['/images/crochet-sunflower-car-hanging.jpg'],
      colors: [
        { name: 'Vibrant Sunflower Gold', hex: '#F39C12' },
        { name: 'Warm Amber Daisy', hex: '#E67E22' },
      ],
      sizes: ['Standard Car Mirror Drop (22 cm)'],
    },
    {
      slug: 'crochet-spiderman-amigurumi',
      name: 'Artisan Spiderman Hero Amigurumi Doll Collectible',
      category: 'Crochet',
      collection: 'Boho Blooms',
      priceINR: 1150,
      priceUSD: 15,
      originalPriceINR: 1400,
      originalPriceUSD: 18,
      rating: 5.0,
      reviewCount: 41,
      description: 'The beloved web-slinging hero reimagined in charming hand-crocheted amigurumi form! Crafted with vibrant red and royal blue wool, hand-embroidered black webbing, felt safety eyes, and posed limbs. Sits upright on any desk, car dashboard, or collector shelf.',
      storySnippet: 'Takes over 8 hours of tight amigurumi stitch tension to ensure a firm, durable shape that lasts.',
      material: 'Anti-pilling Acrylic & Cotton Wool, Hypoallergenic Polyfill, Safety Felt',
      inStock: true,
      stockQuantity: 15,
      sku: 'SRJ-CR-14',
      dimensions: 'Height 16 cm × Width 10 cm',
      careInstructions: 'Spot clean with a damp sponge. Not intended as a chew toy for infants.',
      deliveryInfo: 'Dispatched in collectible gift box in 2-3 business days.',
      isTrending: true,
      isFeatured: true,
      badge: 'Collector Edition',
      images: ['/images/crochet-spiderman-amigurumi.jpg'],
      colors: [
        { name: 'Classic Red & Royal Blue', hex: '#D63031' },
      ],
      sizes: ['Desktop Collectible (16 cm)'],
    },
    {
      slug: 'crochet-grogu-amigurumi-keychain',
      name: 'Galactic Grogu Baby Amigurumi Charm Keychain',
      category: 'Crochet',
      collection: 'Boho Blooms',
      priceINR: 690,
      priceUSD: 9,
      originalPriceINR: 850,
      originalPriceUSD: 11,
      rating: 5.0,
      reviewCount: 37,
      description: 'The galaxy’s most adorable child in chibi amigurumi format. Features wide sage green pointed ears, deep safety bead eyes, oversized cozy sand robe with ribbed collar, and an antique brass keychain ring.',
      storySnippet: 'May the artisanal force be with you! Hand-knotted with obsessive attention to character detail.',
      material: 'Soft Combed Cotton Yarn, Brass Hardware, Polyfill',
      inStock: true,
      stockQuantity: 25,
      sku: 'SRJ-CR-15',
      dimensions: 'Height 9 cm × Ear Span 11 cm',
      careInstructions: 'Spot clean with mild soapy water.',
      deliveryInfo: 'Ships within 48 hours.',
      isTrending: true,
      isFeatured: false,
      badge: 'Fan Favorite',
      images: ['/images/crochet-grogu-amigurumi-keychain.jpg'],
      colors: [
        { name: 'Sage Green & Sand Robe', hex: '#9CAF88' },
      ],
      sizes: ['Keychain Charm (9 cm)'],
    },
    {
      slug: 'crochet-stitch-amigurumi-keychain',
      name: 'Stitch Alien Companion Amigurumi Bag Charm',
      category: 'Crochet',
      collection: 'Boho Blooms',
      priceINR: 690,
      priceUSD: 9,
      originalPriceINR: 850,
      originalPriceUSD: 11,
      rating: 4.9,
      reviewCount: 30,
      description: 'Expressive hand-crocheted Stitch alien companion amigurumi with sky-blue ears, tufted head hair, signature turquoise nose, and a sturdy metal swivel clasp. An irresistible charm for bags, totes, and keys.',
      storySnippet: 'Ohana means family, and family means never leaving your handcrafted favorites behind.',
      material: 'Milk Cotton Yarn, Safety Eyes, Metal Swivel Clasp',
      inStock: true,
      stockQuantity: 25,
      sku: 'SRJ-CR-16',
      dimensions: 'Height 9 cm × Width 8 cm',
      careInstructions: 'Spot clean with damp cloth.',
      deliveryInfo: 'Ships within 48 hours.',
      isTrending: true,
      isFeatured: false,
      badge: 'Trending Charm',
      images: ['/images/crochet-stitch-amigurumi-keychain.jpg'],
      colors: [
        { name: 'Ocean Blue & Lavender Pink', hex: '#3498DB' },
      ],
      sizes: ['Bag Charm (9 cm)'],
    },
  ];

  for (const p of productsData) {
    const { images, colors, sizes, ...productFields } = p;
    const createdProduct = await prisma.product.create({
      data: {
        ...productFields,
        images: {
          create: images.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            order: idx,
          })),
        },
        colors: {
          create: colors.map((c) => ({
            name: c.name,
            hex: c.hex,
          })),
        },
        sizes: {
          create: sizes.map((s) => ({
            sizeName: s,
          })),
        },
      },
    });

    // Add sample verified reviews for products
    if (p.slug === 'crochet-artisan-floral-bouquet') {
      await prisma.review.create({
        data: {
          productId: createdProduct.id,
          userId: customerUser.id,
          authorName: 'Sneha Patel',
          authorLocation: 'Bangalore, India',
          rating: 5,
          comment: 'I am totally in love with the crochet creations! The sunflower bouquet is shaped with such perfection. It adds so much lasting warmth to my living room. Worth every single rupee.',
        },
      });
    } else if (p.slug === 'crochet-sunflower-tote-crossbody') {
      await prisma.review.create({
        data: {
          productId: createdProduct.id,
          userId: customerUser.id,
          authorName: 'Aditya Kumar',
          authorLocation: 'Delhi, India',
          rating: 5,
          comment: 'Bought the artisan sunflower granny square tote bag. The stitch tension, inner lining, and sturdy straps are top notch! Truly genuine handcrafted heirloom work.',
        },
      });
    }
  }

  console.log(`📦 Seeded ${productsData.length} Products with full attributes, colors, sizes, and images.`);

  // 4. Seed Coupons
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

  console.log('🎟️ Seeded Active Discount Coupons: SRIJAN10, WELCOME15, RAKHI500');

  // 5. Seed a Sample Order for the demo customer
  const firstProduct = await prisma.product.findFirst({
    where: { slug: 'crochet-artisan-floral-bouquet' },
  });

  if (firstProduct) {
    await prisma.order.create({
      data: {
        orderNumber: 'SRJ-2026-1001',
        userId: customerUser.id,
        guestName: customerUser.name,
        guestEmail: customerUser.email,
        guestPhone: customerUser.phone,
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
            productId: firstProduct.id,
            productName: firstProduct.name,
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
    console.log('🛍️ Seeded Sample Live Order #SRJ-2026-1001 for tracking');
  }

  // 6. Seed a Sample Custom Commission Request
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

  console.log('🎨 Seeded Sample Bespoke Custom Request');
  console.log('✨ Srijan Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
