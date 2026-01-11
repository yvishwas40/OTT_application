import 'dotenv/config';
import * as cron from 'node-cron';
import { PublishingWorker } from './publishing-worker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }

  const publishingWorker = new PublishingWorker(prisma);

  console.log('🚀 Starting OTT CMS Worker...');

  // Run publishing worker every minute
  cron.schedule('* * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Running publishing worker...`);

    try {
      const published = await publishingWorker.processScheduledLessons();
      if (published.length > 0) {
        console.log(`✅ Published ${published.length} lessons:`, published.map(l => l.title));
      }
    } catch (error) {
      console.error('❌ Publishing worker error:', error);
    }
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('🛑 Shutting down worker...');
    await prisma.$disconnect();
    process.exit(0);
  });

  console.log('⏱️  Publishing worker scheduled (runs every minute)');
  console.log('🔍 Monitoring for scheduled lessons...');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});