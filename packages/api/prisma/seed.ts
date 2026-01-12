import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const seriesData = [
  {
    title: 'Pelli Gola',
    desc: 'A light-hearted Telugu relationship drama on modern marriage.',
    genre: 'Romance',
  },
  {
    title: 'Software DevLOVEper',
    desc: 'Love, bugs, and deadlines in a software engineer’s life.',
    genre: 'Comedy',
  },
  {
    title: 'Gulf Love Story',
    desc: 'A touching long-distance love story across countries.',
    genre: 'Romance',
  },
  {
    title: 'Middle Class Madhu',
    desc: 'Comedy-drama about dreams, money, and middle-class emotions.',
    genre: 'Comedy',
  },
  {
    title: 'MBA Meme School',
    desc: 'MBA campus life told through humor and memes.',
    genre: 'Comedy',
  },
  {
    title: 'The Software Story',
    desc: 'Reality of IT life, office politics, and personal growth.',
    genre: 'Drama',
  },
  {
    title: 'Engineering Girls – Telugu Version',
    desc: 'Engineering life through the perspective of young women.',
    genre: 'Comedy',
  },
  {
    title: 'College Diaries (Telugu)',
    desc: 'Friendship, love, exams, and unforgettable college memories.',
    genre: 'Romance',
  },
];

async function main() {
  console.log('🌱 Seeding Chai Shorts database...');

  // 1. Users
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

  // 2. Topics
  const topics = ['Romance', 'Comedy', 'Thriller', 'Drama'];
  const topicMap = new Map();

  for (const name of topics) {
    const topic = await prisma.topic.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    topicMap.set(name, topic.id);
  }

  // 3. Programs, Seasons, Episodes, Assets
  for (const series of seriesData) {
    // Create Program
    const program = await prisma.program.create({
      data: {
        title: series.title,
        description: series.desc,
        languagePrimary: 'te',
        languagesAvailable: ['te'],
        status: 'PUBLISHED',
        publishedAt: new Date(),
        topics: {
          create: { topicId: topicMap.get(series.genre) || topicMap.get('Comedy') },
        },
      },
    });

    // Program Assets
    await prisma.programAsset.createMany({
      data: [
        {
          programId: program.id,
          language: 'te',
          variant: 'PORTRAIT',
          assetType: 'poster',
          url: 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg',
        },
        {
          programId: program.id,
          language: 'te',
          variant: 'LANDSCAPE',
          assetType: 'poster',
          url: 'https://images.pexels.com/photos/3617512/pexels-photo-3617512.jpeg',
        },
      ],
    });

    // Create Season
    const season = await prisma.term.create({
      data: {
        programId: program.id,
        termNumber: 1,
        title: 'Season 1',
      },
    });

    // Create 3 Episodes
    for (let i = 1; i <= 3; i++) {
      const lesson = await prisma.lesson.create({
        data: {
          termId: season.id,
          lessonNumber: i,
          title: `Episode ${i} – ${series.title}`,
          contentType: 'VIDEO',
          durationMs: 120000, // 2 minutes
          isPaid: false,
          contentLanguagePrimary: 'te',
          contentLanguagesAvailable: ['te'],
          contentUrlsByLanguage: {
            te: `https://example.com/video/${program.id}_ep${i}.mp4`,
          },
          status: 'PUBLISHED',
          publishedAt: new Date(),
        }
      });

      // Lesson Assets (Thumbnails)
      await prisma.lessonAsset.createMany({
        data: [
          {
            lessonId: lesson.id,
            language: 'te',
            variant: 'PORTRAIT',
            assetType: 'thumbnail',
            url: 'https://images.pexels.com/photos/1525041/pexels-photo-1525041.jpeg',
          },
          {
            lessonId: lesson.id,
            language: 'te',
            variant: 'LANDSCAPE',
            assetType: 'thumbnail',
            url: 'https://images.pexels.com/photos/1525042/pexels-photo-1525042.jpeg',
          }
        ]
      });
    }
  }

  console.log('✅ Chai Shorts database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
