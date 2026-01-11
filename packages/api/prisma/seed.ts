import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const editorPassword = await bcrypt.hash('editor123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {},
    create: {
      email: 'editor@example.com',
      password: editorPassword,
      role: 'EDITOR',
    },
  });

  // Create topics
  const techTopic = await prisma.topic.upsert({
    where: { name: 'Technology' },
    update: {},
    create: { name: 'Technology' },
  });

  const businessTopic = await prisma.topic.upsert({
    where: { name: 'Business' },
    update: {},
    create: { name: 'Business' },
  });

  const designTopic = await prisma.topic.upsert({
    where: { name: 'Design' },
    update: {},
    create: { name: 'Design' },
  });

  // Create programs
  const jsProgram = await prisma.program.create({
    data: {
      title: 'Complete JavaScript Mastery',
      description: 'Master JavaScript from basics to advanced concepts including ES6+, async programming, and modern frameworks.',
      languagePrimary: 'en',
      languagesAvailable: ['en', 'es', 'fr'],
      status: 'PUBLISHED',
      publishedAt: new Date('2024-01-01'),
      topics: {
        create: [
          { topicId: techTopic.id },
        ],
      },
    },
  });

  const reactProgram = await prisma.program.create({
    data: {
      title: 'React Development Bootcamp',
      description: 'Learn React from scratch and build modern web applications with hooks, context, and state management.',
      languagePrimary: 'en',
      languagesAvailable: ['en', 'es'],
      status: 'DRAFT',
      topics: {
        create: [
          { topicId: techTopic.id },
        ],
      },
    },
  });

  // Create program assets
  await prisma.programAsset.createMany({
    data: [
      {
        programId: jsProgram.id,
        language: 'en',
        variant: 'PORTRAIT',
        assetType: 'poster',
        url: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        programId: jsProgram.id,
        language: 'en',
        variant: 'LANDSCAPE',
        assetType: 'poster',
        url: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        programId: reactProgram.id,
        language: 'en',
        variant: 'PORTRAIT',
        assetType: 'poster',
        url: 'https://images.pexels.com/photos/11035540/pexels-photo-11035540.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        programId: reactProgram.id,
        language: 'en',
        variant: 'LANDSCAPE',
        assetType: 'poster',
        url: 'https://images.pexels.com/photos/11035365/pexels-photo-11035365.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
    ],
  });

  // Create terms for JavaScript program
  const jsTerm1 = await prisma.term.create({
    data: {
      programId: jsProgram.id,
      termNumber: 1,
      title: 'JavaScript Fundamentals',
    },
  });

  const jsTerm2 = await prisma.term.create({
    data: {
      programId: jsProgram.id,
      termNumber: 2,
      title: 'Advanced JavaScript',
    },
  });

  // Create terms for React program
  const reactTerm1 = await prisma.term.create({
    data: {
      programId: reactProgram.id,
      termNumber: 1,
      title: 'React Basics',
    },
  });

  // Create lessons for JavaScript program
  const jsLesson1 = await prisma.lesson.create({
    data: {
      termId: jsTerm1.id,
      lessonNumber: 1,
      title: 'Variables and Data Types',
      contentType: 'VIDEO',
      durationMs: 1800000, // 30 minutes
      isPaid: false,
      contentLanguagePrimary: 'en',
      contentLanguagesAvailable: ['en', 'es'],
      contentUrlsByLanguage: {
        en: 'https://example.com/videos/js-variables-en.mp4',
        es: 'https://example.com/videos/js-variables-es.mp4',
      },
      subtitleLanguages: ['en', 'es'],
      subtitleUrlsByLanguage: {
        en: 'https://example.com/subtitles/js-variables-en.vtt',
        es: 'https://example.com/subtitles/js-variables-es.vtt',
      },
      status: 'PUBLISHED',
      publishedAt: new Date('2024-01-02'),
    },
  });

  const jsLesson2 = await prisma.lesson.create({
    data: {
      termId: jsTerm1.id,
      lessonNumber: 2,
      title: 'Functions and Scope',
      contentType: 'VIDEO',
      durationMs: 2400000, // 40 minutes
      isPaid: true,
      contentLanguagePrimary: 'en',
      contentLanguagesAvailable: ['en'],
      contentUrlsByLanguage: {
        en: 'https://example.com/videos/js-functions-en.mp4',
      },
      status: 'PUBLISHED',
      publishedAt: new Date('2024-01-03'),
    },
  });

  const jsLesson3 = await prisma.lesson.create({
    data: {
      termId: jsTerm2.id,
      lessonNumber: 1,
      title: 'Async Programming',
      contentType: 'VIDEO',
      durationMs: 3000000, // 50 minutes
      isPaid: true,
      contentLanguagePrimary: 'en',
      contentLanguagesAvailable: ['en'],
      contentUrlsByLanguage: {
        en: 'https://example.com/videos/js-async-en.mp4',
      },
      status: 'SCHEDULED',
      publishAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
    },
  });

  // Create lessons for React program
  const reactLesson1 = await prisma.lesson.create({
    data: {
      termId: reactTerm1.id,
      lessonNumber: 1,
      title: 'Introduction to React',
      contentType: 'ARTICLE',
      isPaid: false,
      contentLanguagePrimary: 'en',
      contentLanguagesAvailable: ['en'],
      contentUrlsByLanguage: {
        en: 'https://example.com/articles/react-intro-en.html',
      },
      status: 'DRAFT',
    },
  });

  const reactLesson2 = await prisma.lesson.create({
    data: {
      termId: reactTerm1.id,
      lessonNumber: 2,
      title: 'Components and Props',
      contentType: 'VIDEO',
      durationMs: 2700000, // 45 minutes
      isPaid: false,
      contentLanguagePrimary: 'en',
      contentLanguagesAvailable: ['en'],
      contentUrlsByLanguage: {
        en: 'https://example.com/videos/react-components-en.mp4',
      },
      status: 'DRAFT',
    },
  });

  const reactLesson3 = await prisma.lesson.create({
    data: {
      termId: reactTerm1.id,
      lessonNumber: 3,
      title: 'State and Lifecycle',
      contentType: 'VIDEO',
      durationMs: 3600000, // 60 minutes
      isPaid: true,
      contentLanguagePrimary: 'en',
      contentLanguagesAvailable: ['en'],
      contentUrlsByLanguage: {
        en: 'https://example.com/videos/react-state-en.mp4',
      },
      status: 'SCHEDULED',
      publishAt: new Date(Date.now() + 1 * 60 * 1000), // 1 minute from now
    },
  });

  // Create lesson assets
  await prisma.lessonAsset.createMany({
    data: [
      // JS Lesson 1 assets
      {
        lessonId: jsLesson1.id,
        language: 'en',
        variant: 'PORTRAIT',
        assetType: 'thumbnail',
        url: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        lessonId: jsLesson1.id,
        language: 'en',
        variant: 'LANDSCAPE',
        assetType: 'thumbnail',
        url: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      // JS Lesson 2 assets
      {
        lessonId: jsLesson2.id,
        language: 'en',
        variant: 'PORTRAIT',
        assetType: 'thumbnail',
        url: 'https://images.pexels.com/photos/276452/pexels-photo-276452.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        lessonId: jsLesson2.id,
        language: 'en',
        variant: 'LANDSCAPE',
        assetType: 'thumbnail',
        url: 'https://images.pexels.com/photos/276452/pexels-photo-276452.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      // JS Lesson 3 assets
      {
        lessonId: jsLesson3.id,
        language: 'en',
        variant: 'PORTRAIT',
        assetType: 'thumbnail',
        url: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        lessonId: jsLesson3.id,
        language: 'en',
        variant: 'LANDSCAPE',
        assetType: 'thumbnail',
        url: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      // React Lesson 3 assets (for scheduled lesson)
      {
        lessonId: reactLesson3.id,
        language: 'en',
        variant: 'PORTRAIT',
        assetType: 'thumbnail',
        url: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        lessonId: reactLesson3.id,
        language: 'en',
        variant: 'LANDSCAPE',
        assetType: 'thumbnail',
        url: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user: admin@example.com / admin123');
  console.log('👤 Editor user: editor@example.com / editor123');
  console.log(`📚 Created ${await prisma.program.count()} programs`);
  console.log(`📖 Created ${await prisma.lesson.count()} lessons`);
  console.log(`⏱️  Scheduled lessons will publish in 1-2 minutes`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });