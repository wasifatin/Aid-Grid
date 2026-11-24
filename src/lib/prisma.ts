import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import os from 'os';

function getDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;

  // If a remote cloud database URL is configured (e.g. Neon, Supabase, Turso, Postgres, MySQL)
  if (
    envUrl &&
    (envUrl.startsWith('postgres') ||
      envUrl.startsWith('mysql') ||
      envUrl.startsWith('libsql') ||
      envUrl.startsWith('prisma://'))
  ) {
    return envUrl;
  }

  // Detect serverless environments with a read-only root filesystem (Vercel / AWS Lambda / Netlify)
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.NETLIFY);

  if (isServerless) {
    // In serverless Linux, /tmp is always the writable partition
    const tmpDir = process.platform === 'win32' ? os.tmpdir() : '/tmp';
    const tmpDbPath = path.join(tmpDir, 'dev.db');

    // Candidate locations where Next.js bundles the SQLite database
    const candidates = [
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.join(process.cwd(), 'dev.db'),
      path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
      path.join(__dirname, '..', '..', '..', 'prisma', 'dev.db'),
      '/var/task/prisma/dev.db',
    ];

    try {
      fs.mkdirSync(path.dirname(tmpDbPath), { recursive: true });

      if (!fs.existsSync(tmpDbPath)) {
        for (const candidate of candidates) {
          if (fs.existsSync(candidate)) {
            fs.copyFileSync(candidate, tmpDbPath);
            console.log(`[AidGrid Prisma] Successfully copied database from ${candidate} to ${tmpDbPath}`);
            break;
          }
        }
      }

      if (fs.existsSync(tmpDbPath)) {
        process.env.DATABASE_URL = `file:${tmpDbPath}`;
        return `file:${tmpDbPath}`;
      }
    } catch (err) {
      console.error('[AidGrid Prisma] Failed to setup writable serverless SQLite database:', err);
    }
  }

  return envUrl;
}

const prismaClientSingleton = () => {
  const dbUrl = getDatabaseUrl();
  return new PrismaClient({
    datasources: dbUrl
      ? {
          db: {
            url: dbUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma: PrismaClient = global.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}

export default prisma;
