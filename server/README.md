# Srijan Microservices Backend Architecture

This document describes the decoupled, production-ready Microservices Architecture powering **Srijan** artisanal e-commerce.

---

## 🏛️ System Architecture

```
                                  +----------------------------------+
                                  |   Patron / Admin Client (Vite)   |
                                  |      http://localhost:5174       |
                                  +-----------------+----------------+
                                                    |
                                          HTTP /api Proxy
                                                    v
+---------------------------------------------------+---------------------------------------------------+
|                                      API GATEWAY (Port 5000)                                          |
|                 Unified routing, metrics aggregation, CORS, proxying, and health reporting            |
+-----------+----------------------+-----------------------+---------------------+----------------------+
            |                      |                       |                     |
     /api/auth              /api/products           /api/orders           /api/custom-requests
            |               /api/reviews            /api/coupons          /api/contact
            v                      v                       v                     v
  +------------------+   +-------------------+   +--------------------+   +-----------------------+
  |   Auth Service   |   |  Product Service  |   |   Order Service    |   |  Commission Service   |
  |    Port 5001     |   |     Port 5002     |   |     Port 5003      |   |       Port 5004       |
  +--------+---------+   +---------+---------+   +---------+----------+   +-----------+-----------+
           |                       ^                       |                          |
           |                       +--- HTTP Internal -----+                          |
           |                            Stock Check &                                 |
           |                           Decrement Call                                 |
           v                               v                       v                          v
  [(auth.db)]                     [(products.db)]         [(orders.db)]              [(commissions.db)]
  User, Address                   Product, Images,        Order, OrderItem,          CustomCommission,
                                  Colors, Sizes, Review   Coupon                     ContactMessage
```

---

## 📦 Services Breakdown

| Service | Port | Database | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `5000` | None | Unified API entry point (`/api/*`), aggregated `/api/admin/metrics`, consolidated `/api/health`. |
| **Auth Service** | `5001` | `auth.db` | Patron registration, authentication, JWT token signing, user profiles, address management. |
| **Product Service** | `5002` | `products.db` | 22 real client products with photos, multi-attribute variants, reviews, real-time inventory management. |
| **Order Service** | `5003` | `orders.db` | Order checkout, tracking, coupon validation & usage tracking, direct payment status handling. |
| **Commission Service** | `5004` | `commissions.db` | Custom bespoke artisan requests, wedding floral resin preservation inquiries, contact messages. |

---

## 🔄 Inter-Service Workflows

### 1. Checkout & Inventory Decrement
1. Client submits order payload to `POST http://localhost:5000/api/orders`.
2. Gateway routes to **Order Service** (`5003`).
3. Order Service invokes **Product Service** (`5002/internal/stock-check`) to verify live stock for each cart item.
4. Order Service applies coupon discounts (e.g., `SRIJAN10`, `WELCOME15`), generates an artisan order number (`SRJ-2026-XXXX`) and Delhivery tracking number.
5. Order Service saves order and items to `orders.db`.
6. Order Service invokes **Product Service** (`5002/internal/decrement-stock`) to atomically decrement stock quantities in `products.db`.

### 2. Admin Dashboard Aggregator
When viewing `/admin` on the frontend, the client calls `GET http://localhost:5000/api/admin/metrics`. The API Gateway queries:
- `http://localhost:5002/metrics` (Product counts & inventory status)
- `http://localhost:5003/metrics` (Total revenue, active orders, recent shipments)
- `http://localhost:5004/metrics` (Custom commission quotes & contact inquiries)

The Gateway merges these responses into a single JSON payload.

---

## 🚀 Running Locally

### 1. Install & Build All Services
```bash
# Push database schemas
npm run services:push

# Seed databases with real client products and live initial orders
npm run services:seed
```

### 2. Start Services
```bash
# Concurrently launch Gateway, all 4 microservices, and Vite frontend
npm run dev:services
```

---

## 🐳 Docker Containerization

Run the complete microservices stack via Docker Compose:
```bash
docker-compose up --build
```

---

## 🧪 Verification & Testing

An automated end-to-end verification script is included at the root:
```bash
node test-gateway.js
```
Runs 10 tests across all services, testing authentication, product catalog, tracking, coupon validation, and inter-service inventory decrements.
