# CampusConnect

A full-stack student-to-student marketplace for college communities.
**Stack:** React (Vite) + Bootstrap 5 · Node.js + Express · MySQL · JWT + bcrypt

## Features
- Student registration / login (JWT, bcrypt), profile update
- Add, edit, delete listings with image upload (JPG/PNG/WEBP, max 2 MB)
- Search + category, price and condition filters
- Wishlist, buyer–seller enquiries, product reporting
- Admin panel: dashboard stats, approve/reject listings, manage users, categories, reports
- Role-based authorization, parameterized SQL, input validation, proper HTTP codes

## Setup

### 1. Database
Open `database/campusconnect.sql` in MySQL Workbench and execute it.

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env     # then edit DB_PASSWORD and JWT_SECRET
npm run seed:admin       # creates the admin account from .env
npm run dev              # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev              # http://localhost:5173
```

### Default admin (from `.env.example`)
- Email: `admin@campusconnect.com`
- Password: `Admin@123`  (change it in `.env` before seeding)

## Try it
1. Register two student accounts (use two browsers or one normal + one incognito window).
2. Student A: **Sell** → add a product (status = *Pending*).
3. Login as admin → **Admin → Products** → *Approve*.
4. Student B: browse the marketplace, add to wishlist, send an enquiry.
5. Student A: **Enquiries** → mark as responded.

## API summary
| Area | Endpoints |
|------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET/PUT /api/auth/profile` |
| Products | `GET /api/products`, `GET /api/products/my-listings`, `GET/PUT/DELETE /api/products/:id`, `POST /api/products`, `POST /api/products/:id/report` |
| Categories | `GET /api/categories`, admin: `POST/PUT/DELETE` |
| Wishlist | `GET/POST /api/wishlist`, `DELETE /api/wishlist/:productId` |
| Enquiries | `POST /api/enquiries`, `GET /api/enquiries/sent`, `GET /api/enquiries/received`, `PUT /api/enquiries/:id` |
| Admin | `GET /api/admin/dashboard`, `/users`, `/products`, `/reports`; `PUT /api/admin/products/:id/status`, `PUT /api/admin/reports/:id`; `DELETE /api/admin/users/:id` |

Send the JWT as `Authorization: Bearer <token>` (Postman: Auth tab → Bearer Token).

## Folder structure
```
CampusConnect/
├── backend/    config · controllers · middleware · routes · uploads · server.js
├── frontend/   src/{components,pages,context,services}
└── database/   campusconnect.sql
```
