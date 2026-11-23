# DEPLOYMENT SPECIFICATION & PRODUCTION GUIDE
## AIDGRID Production Deployment Architecture

AidGrid is built on Next.js 14 and Prisma ORM, designed for low-latency serverless or containerized deployment.

---

### 1. Target Hosting Platforms

- **Frontend & Serverless API Routes:** Vercel / AWS Amplify / Cloudflare Pages
- **Database Layer:** Hosted PostgreSQL (Supabase / Neon / AWS RDS) or persistent containerized SQLite
- **Object Storage for Proof Photos:** AWS S3 / Cloudflare R2 / Supabase Storage

---

### 2. Production Environment Configuration

Set the following variables in the production deployment environment:
```env
DATABASE_URL="postgresql://user:password@host:5432/aidgrid?sslmode=require"
JWT_SECRET="aidgrid-production-hack-the-vibe-2026-super-secret-key-32chars"
NEXT_PUBLIC_APP_URL="https://aidgrid.vercel.app"
NODE_ENV="production"
```

---

### 3. Build & Release Pipeline

```bash
# Generate Prisma Client for production target
npx prisma generate

# Apply migrations
npx prisma migrate deploy

# Compile production build
npm run build

# Start production server
npm run start
```
