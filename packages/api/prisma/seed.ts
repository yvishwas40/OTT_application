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
    const posterMap: Record<string, { portrait: string; landscape: string }> = {
    'Pelli Gola': {
      portrait: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5jL8n6KJMSAdymVKQwq5AcN6aqvw9wCY3hQ&s',
      landscape: 'https://d2zub9v50g8scn.cloudfront.net/yupptv/Movies/yupp/1080x400/Pelli_Gola_254X191.jpg',
    },
    'Software DevLOVEper': {
      portrait: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSrDXhwBi9-midfUSgY2ANHX1Lzn25vLvPbQ&s',
      landscape: 'https://i.ytimg.com/vi/ZvISbJNSolg/hq720.jpg?sqp=-oaymwEXCK4FEIIDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLBy2i8sbYVAWVMG0m7nU_2iDBhjoA',
    },
    'Gulf Love Story': {
      portrait: 'https://filmfreeway-production-storage-01-connector.filmfreeway.com/press_kits/posters/002/285/714/original/bf2756b508-poster.jpg?1677263627',
      landscape: 'https://static.toiimg.com/thumb/msid-59131037,width-400,resizemode-4/59131037.jpg',
    },
    'Middle Class Madhu': {
      portrait: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrtgWwjGw9DDqcNxTAcSmcg3F3ciORjtD1vw&s',
      landscape: 'https://i.ytimg.com/vi/VBif6erzdc8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBOJKfoemrM4zcqTrmhefr8p1qFYg',
    },
    'MBA Meme School': {
      portrait: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDjLlokIkoFqUyLYlcLWR50gFqU_7o8WIHoQ&s',
      landscape: 'https://i.ytimg.com/vi/Yo_7ngJvcTs/maxresdefault.jpg',
    },
    'The Software Story': {
      portrait: 'https://i.ytimg.com/vi/yp7zd1GqM4M/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLANpZ0E-w7osry1f4OAmMGYneg-XA',
      landscape: 'https://i.ytimg.com/vi/cO6lmuw0mHg/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCt8XAra1VswsBut4ZShJfN3v2xZw',
    },
    'Engineering Girls – Telugu Version': {
      portrait: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQss9IoCyegiAtdn5XtprNr1bSd10A-gB-FmA&s',
      landscape: 'https://i.ytimg.com/vi/ezHRJaG0Ijk/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLB1tvPNUHNyOl568zcdhvqSER9hPg',
    },
    'College Diaries (Telugu)': {
      portrait: 'https://m.media-amazon.com/images/S/pv-target-images/20b583e2b1ee3767c4b2291e9b374cb9a3b6845a0b22c583d9980a590c791c22.jpg',
      landscape: 'https://img.airtel.tv/unsafe/fit-in/1600x0/filters:format(webp)/https://xstreamcp-assets-msp.streamready.in/assets/MINITV/SERIES/6723f4cce61f4322c26cec81/images/LANDSCAPE_169/CAMPUS_DIARIES_S1_1920x1080_16x9.jpg?o=production',
    },
  };


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
