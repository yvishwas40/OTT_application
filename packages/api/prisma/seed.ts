import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Chai Shorts Seed
 * Programs  -> Short Series
 * Terms     -> Seasons
 * Lessons   -> Episodes (2 minutes)
 */

async function main() {
  console.log('🌱 Seeding Chai Shorts database...');

  /* ----------------------------------------------------
   * USERS (CMS)
   * -------------------------------------------------- */
  const adminPassword = await bcrypt.hash('admin123', 10);
  const editorPassword = await bcrypt.hash('editor123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@chaishorts.com' },
    update: {},
    create: {
      email: 'admin@chaishorts.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'editor@chaishorts.com' },
    update: {},
    create: {
      email: 'editor@chaishorts.com',
      password: editorPassword,
      role: 'EDITOR',
    },
  });

  /* ----------------------------------------------------
   * TOPICS / GENRES
   * -------------------------------------------------- */
  const romance = await prisma.topic.upsert({
    where: { name: 'Romance' },
    update: {},
    create: { name: 'Romance' },
  });

  const comedy = await prisma.topic.upsert({
    where: { name: 'Comedy' },
    update: {},
    create: { name: 'Comedy' },
  });

  const thriller = await prisma.topic.upsert({
    where: { name: 'Thriller' },
    update: {},
    create: { name: 'Thriller' },
  });

  /* ----------------------------------------------------
   * SERIES (PROGRAMS)
   * -------------------------------------------------- */

  const chaiLove = await prisma.program.create({
    data: {
      title: 'Chai Lo Oka Love Story',
      description:
        'A tender Telugu short series about unexpected love brewed over evening chai.',
      languagePrimary: 'te',
      languagesAvailable: ['te', 'en'],
      status: 'PUBLISHED',
      publishedAt: new Date(),
      topics: {
        create: [{ topicId: romance.id }],
      },
    },
  });

  const lateNight = await prisma.program.create({
    data: {
      title: 'Last Bus Stop',
      description:
        'A thriller that unfolds during late-night bus rides and quiet conversations.',
      languagePrimary: 'te',
      languagesAvailable: ['te'],
      status: 'DRAFT',
      topics: {
        create: [{ topicId: thriller.id }],
      },
    },
  });

  /* ----------------------------------------------------
   * SERIES POSTERS
   * -------------------------------------------------- */
  await prisma.programAsset.createMany({
    data: [
      {
        programId: chaiLove.id,
        language: 'te',
        variant: 'PORTRAIT',
        assetType: 'poster',
        url: 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg',
      },
      {
        programId: chaiLove.id,
        language: 'te',
        variant: 'LANDSCAPE',
        assetType: 'poster',
        url: 'https://images.pexels.com/photos/3617512/pexels-photo-3617512.jpeg',
      },
      {
        programId: lateNight.id,
        language: 'te',
        variant: 'PORTRAIT',
        assetType: 'poster',
        url: 'https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg',
      },
      {
        programId: lateNight.id,
        language: 'te',
        variant: 'LANDSCAPE',
        assetType: 'poster',
        url: 'https://images.pexels.com/photos/713150/pexels-photo-713150.jpeg',
      },
    ],
  });

  /* ----------------------------------------------------
   * SEASONS (TERMS)
   * -------------------------------------------------- */
  const chaiSeason1 = await prisma.term.create({
    data: {
      programId: chaiLove.id,
      termNumber: 1,
      title: 'Season 1',
    },
  });

  const nightSeason1 = await prisma.term.create({
    data: {
      programId: lateNight.id,
      termNumber: 1,
      title: 'Season 1',
    },
  });

  /* ----------------------------------------------------
   * EPISODES (LESSONS) – 2 MINUTES EACH
   * -------------------------------------------------- */

  const ep1 = await prisma.lesson.create({
    data: {
      termId: chaiSeason1.id,
      lessonNumber: 1,
      title: 'First Sip',
      contentType: 'VIDEO',
      durationMs: 120000,
      isPaid: false,
      contentLanguagePrimary: 'te',
      contentLanguagesAvailable: ['te', 'en'],
      contentUrlsByLanguage: {
        te: 'https://example.com/chai/ep1-te.mp4',
        en: 'https://example.com/chai/ep1-en.mp4',
      },
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  const ep2 = await prisma.lesson.create({
    data: {
      termId: chaiSeason1.id,
      lessonNumber: 2,
      title: 'Silent Glance',
      contentType: 'VIDEO',
      durationMs: 115000,
      isPaid: false,
      contentLanguagePrimary: 'te',
      contentLanguagesAvailable: ['te'],
      contentUrlsByLanguage: {
        te: 'https://example.com/chai/ep2-te.mp4',
      },
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  const ep3 = await prisma.lesson.create({
    data: {
      termId: chaiSeason1.id,
      lessonNumber: 3,
      title: 'Unspoken Words',
      contentType: 'VIDEO',
      durationMs: 125000,
      isPaid: true,
      contentLanguagePrimary: 'te',
      contentLanguagesAvailable: ['te'],
      contentUrlsByLanguage: {
        te: 'https://example.com/chai/ep3-te.mp4',
      },
      status: 'SCHEDULED',
      publishAt: new Date(Date.now() + 2 * 60 * 1000),
    },
  });

  /* ----------------------------------------------------
   * THUMBNAILS
   * -------------------------------------------------- */
  await prisma.lessonAsset.createMany({
    data: [
      {
        lessonId: ep1.id,
        language: 'te',
        variant: 'PORTRAIT',
        assetType: 'thumbnail',
        url: 'https://images.pexels.com/photos/1525041/pexels-photo-1525041.jpeg',
      },
      {
        lessonId: ep1.id,
        language: 'te',
        variant: 'LANDSCAPE',
        assetType: 'thumbnail',
        url: 'https://images.pexels.com/photos/1525042/pexels-photo-1525042.jpeg',
      },
      {
        lessonId: ep2.id,
        language: 'te',
        variant: 'PORTRAIT',
        assetType: 'thumbnail',
        url: 'https://images.pexels.com/photos/3772622/pexels-photo-3772622.jpeg',
      },
      {
        lessonId: ep2.id,
        language: 'te',
        variant: 'LANDSCAPE',
        assetType: 'thumbnail',
        url: 'https://images.pexels.com/photos/3772623/pexels-photo-3772623.jpeg',
      },
      {
        lessonId: ep3.id,
        language: 'te',
        variant: 'PORTRAIT',
        assetType: 'thumbnail',
        url: 'https://images.pexels.com/photos/713148/pexels-photo-713148.jpeg',
      },
      {
        lessonId: ep3.id,
        language: 'te',
        variant: 'LANDSCAPE',
        assetType: 'thumbnail',
        url: 'https://images.pexels.com/photos/713147/pexels-photo-713147.jpeg',
      },
    ],
  });

  console.log('✅ Chai Shorts database seeded successfully!');
  console.log('👤 Admin: admin@chaishorts.com / admin123');
  console.log('👤 Editor: editor@chaishorts.com / editor123');
  console.log('⏱️ One episode will auto-publish in ~2 minutes');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
