# SETUP & INITIALIZATION GUIDE
## Local Development and Verification Guide

Follow these steps to initialize and run AidGrid locally.

---

### 1. System Requirements
- Node.js 18.18 or higher (tested on Node v20 & v26)
- Git 2.30+
- Operating System: Windows, macOS, or Linux

---

### 2. Setup Procedure

```bash
# 1. Clone repository
git clone https://github.com/aidgrid/aidgrid.git
cd aidgrid

# 2. Copy environment template
copy .env.example .env

# 3. Install packages
npm install

# 4. Generate Prisma Client and setup local database
npx prisma generate
npx prisma db push

# 5. Populate database with realistic Dhaka pilot data
npm run db:seed

# 6. Execute test suite
npm run test

# 7. Start application
npm run dev
```

Access the application in your browser at `http://localhost:3000`.
