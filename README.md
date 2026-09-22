<p align="center">
  <img src="https://img.shields.io/badge/Srijan-Handcrafted%20Elegance-C48B71?style=for-the-badge&labelColor=2B2523" alt="Srijan Badge" />
</p>

<h1 align="center">🪷 Srijan — Handcrafted Elegance by Rakhi</h1>

<p align="center">
  <em>A luxury artisan e-commerce platform for bespoke crochet bouquets, resin art, ceramic tableware, and personalized handcrafted décor.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white" />
</p>

---

## ✨ Overview

**Srijan** (meaning "creation" in Sanskrit) is a full-stack artisan e-commerce platform built for a real client. It features a magazine-style editorial frontend and a decoupled microservices backend, designed to showcase and sell handcrafted artisan products with a premium, luxury aesthetic.

### Key Highlights

- 🎨 **Magazine-Style UI** — Full-frame editorial hero grid inspired by luxury fashion houses
- 🏗️ **Microservices Architecture** — 4 independent services + API Gateway
- 🎬 **Hero Video Integration** — Artisan reel with play/pause & mute controls
- 🛒 **Complete E-Commerce Flow** — Browse → Cart → Checkout → Order Tracking
- 🎨 **Custom Commission System** — Bespoke artisan requests & wedding floral preservation
- 📊 **Admin Dashboard** — Aggregated metrics across all services
- 🐳 **Docker Ready** — Full containerization via Docker Compose

---

## 🏛️ Architecture

```
                              ┌──────────────────────────────────┐
                              │   Frontend Client (React/Vite)   │
                              │       http://localhost:5174       │
                              └────────────────┬─────────────────┘
                                               │
                                     HTTP /api Proxy
                                               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY (Port 5000)                             │
│         Unified routing · Metrics aggregation · CORS · Health checks         │
└───────┬──────────────┬──────────────────┬──────────────────┬─────────────────┘
        │              │                  │                  │
   /api/auth     /api/products       /api/orders      /api/custom-requests
                 /api/reviews        /api/coupons     /api/contact
        ▼              ▼                  ▼                  ▼
  ┌──────────┐  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐
  │   Auth   │  │   Product   │  │    Order     │  │   Commission    │
  │  :5001   │  │    :5002    │  │    :5003     │  │     :5004       │
  └────┬─────┘  └──────┬──────┘  └──────┬───────┘  └───────┬─────────┘
       ▼               ▼                ▼                   ▼
   [auth.db]      [products.db]    [orders.db]       [commissions.db]
```

| Service | Port | Database | Responsibilities |
|:--------|:-----|:---------|:-----------------|
| **API Gateway** | `5000` | — | Unified `/api/*` routing, aggregated admin metrics, health reporting |
| **Auth Service** | `5001` | `auth.db` | Registration, JWT authentication, user profiles, address management |
| **Product Service** | `5002` | `products.db` | Product catalog with images, multi-attribute variants, reviews, real-time inventory |
| **Order Service** | `5003` | `orders.db` | Checkout, order tracking, coupon validation, payment status handling |
| **Commission Service** | `5004` | `commissions.db` | Custom bespoke artisan requests, wedding floral preservation, contact messages |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|:-----------|:--------|
| **React 19** | UI framework with latest concurrent features |
| **TypeScript 6** | Type-safe development |
| **Vite 8** | Lightning-fast dev server & build tool |
| **Lucide React** | Premium icon library |
| **Cormorant Garamond** | Editorial luxury serif typography |
| **Plus Jakarta Sans** | Clean modern UI typography |
| **Vanilla CSS** | Full-control styling with CSS Grid & Flexbox |

### Backend
| Technology | Purpose |
|:-----------|:--------|
| **Express 4** | REST API framework |
| **Prisma 6** | Type-safe ORM with SQLite |
| **JWT** | Stateless authentication |
| **Zod** | Runtime request validation |
| **bcryptjs** | Password hashing |
| **Multer** | File upload handling |

### DevOps
| Technology | Purpose |
|:-----------|:--------|
| **Docker Compose** | Multi-container orchestration |
| **Concurrently** | Parallel service management |
| **tsx** | TypeScript execution for Node.js |

---

## 📁 Project Structure

```
srijan/
├── public/                      # Static assets (images, videos)
├── src/                         # Frontend source
│   ├── components/
│   │   ├── home/                # Homepage — HeroCollage, featured sections
│   │   ├── layout/              # Header, Footer, navigation
│   │   ├── shop/                # Product grid, filters
│   │   ├── product/             # Product detail pages
│   │   ├── cart/                # Shopping cart
│   │   ├── checkout/            # Checkout flow
│   │   ├── order/               # Order confirmation & tracking
│   │   ├── auth/                # Login & registration
│   │   ├── admin/               # Admin dashboard
│   │   ├── custom/              # Custom commission requests
│   │   ├── contact/             # Contact form
│   │   ├── about/               # About page
│   │   └── ui/                  # Reusable UI primitives
│   ├── context/                 # React context providers
│   ├── data/                    # Static data & constants
│   ├── services/                # API service layer
│   ├── types/                   # TypeScript type definitions
│   ├── App.tsx                  # Root app with routing
│   ├── index.css                # Global design system
│   └── main.tsx                 # Entry point
│
├── server/                      # Backend monorepo
│   ├── gateway/                 # API Gateway (port 5000)
│   ├── services/
│   │   ├── auth-service/        # Authentication (port 5001)
│   │   ├── product-service/     # Products & reviews (port 5002)
│   │   ├── order-service/       # Orders & coupons (port 5003)
│   │   └── commission-service/  # Custom requests (port 5004)
│   ├── shared/                  # Shared utilities & middleware
│   └── prisma/                  # Prisma configuration
│
├── docker-compose.yml           # Container orchestration
├── test-gateway.js              # End-to-end verification script
├── vite.config.ts               # Vite configuration with API proxy
└── package.json                 # Root scripts & dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Docker** & **Docker Compose** (optional, for containerized setup)

### 1. Clone & Install

```bash
git clone https://github.com/adityars07/Srijan.git
cd Srijan

# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 2. Setup Databases

```bash
# Push Prisma schemas to create SQLite databases
npm run services:push

# Seed databases with real product data & initial orders
npm run services:seed
```

### 3. Run Development Server

```bash
# Launch all services concurrently (Gateway + 4 microservices + Vite frontend)
npm run dev:services
```

This starts:
- 🌐 **Frontend** → `http://localhost:5174`
- 🚪 **API Gateway** → `http://localhost:5000`
- 🔐 **Auth Service** → `http://localhost:5001`
- 📦 **Product Service** → `http://localhost:5002`
- 🛍️ **Order Service** → `http://localhost:5003`
- 🎨 **Commission Service** → `http://localhost:5004`

### 4. Run with Docker (Alternative)

```bash
docker-compose up --build
```

---

## 🔄 Inter-Service Workflows

### Checkout & Inventory Decrement
1. Client submits order to `POST /api/orders`
2. Gateway routes to **Order Service**
3. Order Service calls **Product Service** (`/internal/stock-check`) to verify live stock
4. Coupon discounts are applied (e.g., `SRIJAN10`, `WELCOME15`)
5. Artisan order number generated (`SRJ-2026-XXXX`) with tracking
6. **Product Service** (`/internal/decrement-stock`) atomically decrements inventory

### Admin Dashboard Aggregation
The Gateway queries all service `/metrics` endpoints and merges them into a single response at `GET /api/admin/metrics`:
- Product counts & inventory status from **Product Service**
- Revenue & order metrics from **Order Service**
- Commission quotes & inquiries from **Commission Service**

---

## 🧪 Testing

Run the automated end-to-end verification script:

```bash
node test-gateway.js
```

This executes **10 tests** covering:
- ✅ Authentication (register, login, JWT)
- ✅ Product catalog & search
- ✅ Order tracking & status
- ✅ Coupon validation & usage
- ✅ Inter-service inventory decrements

---

## 🎨 Design Philosophy

Srijan's frontend follows a **luxury editorial aesthetic** inspired by high-end fashion houses:

- **Full-Frame Hero Grid** — Magazine-style layout that fills the entire viewport
- **Artisan Video Reel** — Embedded product video with live indicator and controls
- **Typography** — Cormorant Garamond (serif headlines) + Plus Jakarta Sans (UI body)
- **Color Palette** — Warm earth tones (`#C48B71`, `#2B2523`, `#FAF7F2`) reflecting artisan craftsmanship
- **Micro-Animations** — Subtle hover effects and smooth transitions throughout
- **Responsive Design** — Adapts seamlessly from desktop to mobile viewports

---

## 📜 Available Scripts

| Script | Description |
|:-------|:------------|
| `npm run dev` | Start Vite frontend only |
| `npm run dev:services` | Start all services + frontend concurrently |
| `npm run services:push` | Push Prisma schemas to all service databases |
| `npm run services:seed` | Seed all databases with initial data |
| `npm run build` | TypeScript check + production Vite build |
| `npm run lint` | Run Oxlint for code quality |
| `npm run preview` | Preview production build locally |
| `node test-gateway.js` | Run end-to-end gateway tests |

---

## 📄 License

This project is proprietary and built for a specific client. All rights reserved.

---

<p align="center">
  <strong>Srijan</strong> — Where tradition meets contemporary craft ✦
</p>
