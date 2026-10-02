<div align="center">

# 🧶 Srijan — Handcrafted Elegance by Rakhi

**A premium full-stack e-commerce platform for handcrafted artisanal crochet creations**

[![Live Site](https://img.shields.io/badge/🌐_Live-srijan--handmadebyrakhi.com-C48B71?style=for-the-badge)](https://srijan-handmadebyrakhi.com)
[![Backend API](https://img.shields.io/badge/📡_API-Render-46E3B7?style=for-the-badge)](https://srijan-1nc4.onrender.com/api/health)
[![Database](https://img.shields.io/badge/🐘_DB-Neon_Postgres-00E599?style=for-the-badge)](https://neon.tech)

</div>

---

## 📖 About

**Srijan** (meaning *"creation"* in Sanskrit) is a fully functional e-commerce storefront built for a real artisan business — **Handmade by Rakhi**. The platform showcases and sells handcrafted crochet products including floral bouquets, tote bags, amigurumi dolls, dreamcatchers, keychains, and everyday accessories.

The store features a luxury editorial design aesthetic, live Razorpay payment integration, an admin dashboard for order management, bespoke custom commission requests, and a curated product catalog — all powered by a modern React + Node.js + PostgreSQL stack.

---

## ✨ Features

### 🛍️ Storefront
- **Premium UI** — Luxury editorial design with Cormorant Garamond + Plus Jakarta Sans typography, glassmorphism effects, micro-animations, and smooth transitions
- **Product Catalog** — 16 handcrafted crochet products with real product photography, organized into 5 categories
- **Product Detail Modal** — Rich product pages with image galleries, color/size selectors, material details, care instructions, and delivery info
- **Category Filtering** — Filter by category (Floral & Bouquets, Bags & Totes, Wall Art & Decor, Amigurumi & Keychains, Everyday Accessories), price range, and sort order
- **Search** — Full-text product search with instant results modal
- **Shopping Cart** — Persistent cart drawer with quantity controls, coupon code validation, and price summary
- **Wishlist** — Save favorite products with slide-out drawer
- **Currency Toggle** — INR (₹) / USD ($) dual-currency support across the entire store

### 💳 Checkout & Payments
- **Razorpay Live Integration** — Real payment processing with UPI, credit/debit cards, net banking, and wallets
- **Order Creation** — Automatic order number generation (SRJ-YYYY-XXXX format)
- **Payment Verification** — Cryptographic signature verification for tamper-proof payment confirmation
- **Guest Checkout** — No account required; customers can order with just name, email, and address

### 📦 Order Management
- **Order Tracking** — Customers can track order status by order number or tracking ID
- **Status Pipeline** — PENDING → CONFIRMED → IN_CRAFTING → DISPATCHED → DELIVERED
- **Admin Order Controls** — Update order status, add tracking numbers, and manage fulfillment

### 👩‍💼 Admin Dashboard
- **Rakhi's Studio Management** — Protected admin panel with real-time business metrics
- **Revenue Analytics** — Gross sales, total orders, inventory alerts
- **Product Management** — Create, update, and delete products with full CRUD
- **Order Management** — View all orders, update status, add tracking info
- **Bespoke Inquiries** — Manage custom commission requests with quoting workflow
- **Contact Messages** — Read and manage customer inquiries
- **Coupon Management** — Create and manage discount coupons

### 🎨 Custom Commissions
- **Bespoke Request Form** — Customers can submit custom creation requests specifying category, occasion, budget range, and detailed description
- **Quote Workflow** — Admin reviews inquiry → sends quote → tracks through crafting → marks completed

### 🔐 Authentication
- **JWT-based Auth** — Secure registration and login with bcrypt password hashing
- **Role-based Access** — CUSTOMER and ADMIN roles with middleware-protected routes
- **Admin Panel Protection** — Only authenticated admin users can access studio management

---

## 🏗️ Architecture

```
srijan/
├── src/                          # Frontend (Vite + React + TypeScript)
│   ├── components/
│   │   ├── about/                # About the artisan page
│   │   ├── admin/                # Admin dashboard & management panels
│   │   ├── auth/                 # Login/Register modals
│   │   ├── cart/                 # Cart drawer & management
│   │   ├── checkout/             # Checkout flow & Razorpay integration
│   │   ├── contact/              # Contact form modal
│   │   ├── custom/               # Bespoke commission request modal
│   │   ├── home/                 # Hero, categories, trending, reviews, FAQ
│   │   ├── layout/               # Header, Footer, SearchModal
│   │   ├── order/                # Order tracking view
│   │   ├── product/              # Product detail modal
│   │   ├── shop/                 # Shop catalog, filters, sidebar
│   │   ├── ui/                   # Reusable UI components (Toast, etc.)
│   │   └── wishlist/             # Wishlist drawer
│   ├── context/                  # React Context providers
│   │   ├── AuthContext.tsx        # Authentication state
│   │   ├── CartContext.tsx        # Cart state with localStorage persistence
│   │   └── CurrencyContext.tsx    # INR/USD currency toggle
│   ├── services/
│   │   └── api.ts                # Centralized API client (all backend calls)
│   ├── types/                    # TypeScript type definitions
│   ├── App.tsx                   # Main application with view routing
│   ├── index.css                 # Complete design system (64KB of handcrafted CSS)
│   └── main.tsx                  # React entry point
│
├── server/                       # Backend (Express + Prisma + TypeScript)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts             # Prisma client singleton
│   │   ├── controllers/
│   │   │   ├── admin.controller.ts      # Dashboard metrics
│   │   │   ├── auth.controller.ts       # Register, Login, JWT
│   │   │   ├── contact.controller.ts    # Contact form submissions
│   │   │   ├── coupon.controller.ts     # Coupon CRUD & validation
│   │   │   ├── customRequest.controller.ts  # Bespoke commissions
│   │   │   ├── order.controller.ts      # Order CRUD & tracking
│   │   │   ├── payment.controller.ts    # Razorpay integration
│   │   │   ├── product.controller.ts    # Product CRUD & search
│   │   │   └── review.controller.ts     # Review management
│   │   ├── middlewares/
│   │   │   └── auth.ts           # JWT verification & role guard
│   │   ├── routes/               # Express route definitions
│   │   └── index.ts              # Server entry, CORS, middleware
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema (12 models)
│   │   └── seed.ts               # Database seeder (admin + 16 products)
│   └── package.json
│
├── public/images/                # Product photography (16 real product images)
├── vercel.json                   # Vercel frontend deployment config
├── render.yaml                   # Render backend deployment config
├── vite.config.ts                # Vite dev server config with API proxy
└── package.json                  # Root package with dev scripts
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite 8, Lucide Icons |
| **Styling** | Vanilla CSS (64KB handcrafted design system), Google Fonts |
| **Backend** | Node.js, Express 4, TypeScript |
| **Database** | PostgreSQL (Neon serverless), Prisma ORM |
| **Payments** | Razorpay (Live mode — UPI, Cards, Net Banking, Wallets) |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Validation** | Zod |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render |
| **Domain** | srijan-handmadebyrakhi.com (GoDaddy → Vercel DNS) |

---

## 🗄️ Database Schema

The PostgreSQL database contains **12 models**:

| Model | Purpose |
|-------|---------|
| `User` | Customer & admin accounts with hashed passwords |
| `Address` | Saved shipping addresses per user |
| `Product` | Product catalog with pricing, inventory, and metadata |
| `ProductImage` | Product image URLs with ordering |
| `ProductColor` | Available color variants per product |
| `ProductSize` | Available size options per product |
| `Order` | Customer orders with payment & shipping details |
| `OrderItem` | Individual items within an order |
| `CustomCommission` | Bespoke creation requests with quoting workflow |
| `Review` | Product reviews with ratings |
| `Coupon` | Discount codes (percentage or fixed amount) |
| `ContactMessage` | Customer contact form submissions |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create new customer account |
| `POST` | `/api/auth/login` | Login & receive JWT token |
| `GET` | `/api/auth/me` | Get current authenticated user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List all products (with filtering & pagination) |
| `GET` | `/api/products/:idOrSlug` | Get product by ID or slug |
| `POST` | `/api/products` | Create product (admin only) |
| `PUT` | `/api/products/:id` | Update product (admin only) |
| `DELETE` | `/api/products/:id` | Delete product (admin only) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders` | Create new order |
| `GET` | `/api/orders/track/:orderNumber` | Track order by number |
| `GET` | `/api/orders/my-orders` | Get authenticated user's orders |
| `GET` | `/api/orders` | List all orders (admin only) |
| `PATCH` | `/api/orders/:id/status` | Update order status (admin only) |

### Payments (Razorpay)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments/create-order` | Create Razorpay payment order |
| `POST` | `/api/payments/verify` | Verify payment signature |

### Coupons
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/coupons/validate` | Validate coupon code |
| `GET` | `/api/coupons` | List all coupons (admin only) |
| `POST` | `/api/coupons` | Create coupon (admin only) |

### Custom Commissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/custom-requests` | Submit bespoke creation request |
| `GET` | `/api/custom-requests` | List all requests (admin only) |
| `PATCH` | `/api/custom-requests/:id` | Update request status (admin only) |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/reviews` | List all approved reviews |
| `GET` | `/api/reviews/product/:productId` | Get reviews for a product |
| `POST` | `/api/reviews` | Submit a review |

### Contact
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/contact` | Submit contact message |
| `GET` | `/api/contact` | List all messages (admin only) |
| `PATCH` | `/api/contact/:id/read` | Mark message as read (admin only) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/metrics` | Get dashboard metrics (admin only) |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | API health check with database connectivity status |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **PostgreSQL** database (or a [Neon](https://neon.tech) free account)

### 1. Clone the Repository

```bash
git clone https://github.com/adityars07/Srijan.git
cd Srijan
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Configure Environment Variables

Create a `.env` file in the **project root**:

```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

Create a `.env` file in the **`server/`** directory:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLIENT_URL=http://localhost:5174
PORT=5000
```

### 4. Set Up the Database

```bash
cd server

# Push schema to database
npx prisma db push

# Seed the database with admin user, products, and coupons
npm run db:seed

# (Optional) Open Prisma Studio to browse data
npm run db:studio
```

### 5. Start Development Servers

```bash
# From the project root — starts both frontend (port 5174) and backend (port 5000)
npm run dev          # Frontend only (Vite on :5174)
npm run dev:server   # Backend only (Express on :5000)
```

Or run both simultaneously:

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
npm run dev
```

The Vite dev server proxies `/api` requests to `localhost:5000` automatically.

### 6. Access the App

| URL | Description |
|-----|-------------|
| `http://localhost:5174` | Storefront |
| `http://localhost:5000/api/health` | API health check |
| Login as admin: `admin@srijan.com` / `ArtisanRakhi2026!` | Admin dashboard |

---

## 🌐 Deployment

### Frontend — Vercel

1. Connect the GitHub repository to [Vercel](https://vercel.com)
2. Set the **Root Directory** to `./` (project root)
3. Set the **Build Command** to `npm run build`
4. Set the **Output Directory** to `dist`
5. Add environment variable:
   - `VITE_API_URL` = `https://srijan-1nc4.onrender.com/api` (Config, not Secret)
6. Add your custom domain in Vercel → Settings → Domains

### Backend — Render

1. Connect the GitHub repository to [Render](https://render.com)
2. Create a **Web Service** with:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Add environment variables:
   - `DATABASE_URL` — Neon PostgreSQL connection string
   - `JWT_SECRET` — Secure random string
   - `RAZORPAY_KEY_ID` — Razorpay live key
   - `RAZORPAY_KEY_SECRET` — Razorpay live secret
   - `CLIENT_URL` — `https://srijan-handmadebyrakhi.com`
   - `NODE_ENV` — `production`
   - `PORT` — `5000`

### Database — Neon

1. Create a free project at [neon.tech](https://neon.tech)
2. Copy the pooled connection string
3. Use it as `DATABASE_URL` in both Render and local `.env`

---

## 📦 Product Catalog

The store currently features **16 handcrafted crochet products** across 5 categories:

| Category | Products | Examples |
|----------|----------|---------|
| 🌸 **Floral & Bouquets** | 3 | Sunflower Bouquet, Potted Sunflowers, Evil Eye Stems |
| 👜 **Bags & Totes** | 3 | Sunflower Tote, Eyewear Sleeve, Drawstring Potli |
| 🖼️ **Wall Art & Decor** | 3 | Lavender Dreamcatcher, Emerald Wall Hanging, Car Hanging |
| 🧸 **Amigurumi & Keychains** | 4 | Spiderman Amigurumi, Grogu Keychain, Stitch Charm, Daisy Keychains |
| 💍 **Everyday Accessories** | 3 | Ruffled Scrunchies, Flower Basket Magnet, Bow Charms |

All products include real product photography, dual-currency pricing (INR + USD), color variants, size options, care instructions, and delivery estimates.

---

## 🎟️ Built-in Coupons

| Code | Type | Value | Min Order |
|------|------|-------|-----------|
| `SRIJAN10` | 10% off | Up to ₹500 | ₹1,000 |
| `WELCOME15` | 15% off | Up to ₹1,000 | ₹1,500 |
| `RAKHI500` | ₹500 flat off | — | ₹3,000 |

---

## 🧑‍💻 Author

**Aditya RS** — Full-stack development & deployment

Built for **Rakhi Karn** — Artisan creator behind Srijan Handmade

---

## 📄 License

This project is private and proprietary. All product images and brand assets are owned by Srijan Handmade.
