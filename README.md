# Studio — Private Image Delivery Platform

A password-protected image delivery platform. Admin creates folders, uploads images, and sets a password per folder. Users enter the password to access and download their images.

---

## How It Works

**Admin** logs into a protected panel and can:
- Create folders and assign a password to each
- Upload images into any folder
- Change or regenerate folder passwords
- Delete images or entire folders

**Users** open the site and see only a password prompt. They enter their folder password, view their images, and download them. They cannot see any other folder.

All files are stored privately. Download links are signed and expire in 60 seconds.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Tailwind CSS |
| Backend | Node.js + Express |
| ORM | Prisma 7 |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage (private) |
| Password Hashing | bcrypt |

---

## Project Structure

```
studio/
├── frontend/               # React + Tailwind
│   └── src/
│       ├── pages/
│       │   ├── UserPage.jsx
│       │   ├── AdminPage.jsx
│       │   └── AdminLogin.jsx
│       ├── components/
│       └── api/
│
└── backend/                # Node.js + Express
    ├── prisma/
    │   ├── schema.prisma
    │   ├── migrations/
    │   └── generated/client/
    ├── db/
    │   └── prisma-user.sql
    ├── models/
    │   ├── folderModel.js
    │   └── imageModel.js
    ├── storage/
    │   ├── storageClient.js
    │   └── storageModel.js
    ├── routes/
    │   ├── adminRoutes.js
    │   └── userRoutes.js
    ├── middleware/
    │   └── adminAuth.js
    ├── prismaClient.js
    ├── prisma.config.ts
    └── server.js
```

---

## Environment Variables

### backend/.env
```
# Prisma 7 — two connection strings required
DATABASE_URL="postgres://prisma.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://prisma:[password]@db.[ref].supabase.co:5432/postgres"

# Supabase JS — Storage only
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin
ADMIN_PASSWORD=your-admin-password
ADMIN_SECRET_KEY=your-secret-key

PORT=4000
```

### frontend/.env
```
VITE_API_URL=http://localhost:4000
```

> **Never commit `.env` files.** Both are listed in `.gitignore`.

---

## Getting Started

### 1. Supabase Setup
- Create a new Supabase project
- Run `backend/db/prisma-user.sql` in the Supabase SQL Editor to create a dedicated Prisma database user
- Create a private storage bucket named `studio-images`
- Copy your connection strings from the **Connect** button in the dashboard

### 2. Backend
```bash
cd backend
npm install
# Add your .env file
npx prisma migrate dev --name init
node server.js
```

### 3. Frontend
```bash
cd frontend
npm install
# Add your .env file
npm run dev
```

---

## API Routes

### Admin (protected)
| Method | Path | Description |
|---|---|---|
| POST | `/admin/folders` | Create a folder |
| GET | `/admin/folders` | Get all folders |
| PUT | `/admin/folders/:id/password` | Change folder password |
| DELETE | `/admin/folders/:id` | Delete folder and all its images |
| POST | `/admin/folders/:id/images` | Upload images to a folder |
| DELETE | `/admin/images/:id` | Delete one image |

### User (public)
| Method | Path | Description |
|---|---|---|
| POST | `/user/unlock` | Submit folder password, get folder access |
| GET | `/user/folders/:id/images` | Get image list for a folder |
| GET | `/user/images/:id/download` | Get a signed download URL (60s expiry) |

---

## Prisma 7 Notes

This project uses Prisma 7 which differs from older versions:

- `schema.prisma` has **no datasource block** — connection config lives in `prisma.config.ts`
- The generated client outputs to `prisma/generated/client/` not `@prisma/client`
- Runtime connection uses a **driver adapter** (`@prisma/adapter-pg`)
- Two connection strings: `DATABASE_URL` for the running app, `DIRECT_URL` for the Prisma CLI

---

## License

MIT
