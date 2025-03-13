import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient;
}

// Ensure we only create one instance of PrismaClient
let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.cachedPrisma;
}

// Make sure the client has been initialized before exporting
export { prisma }; 