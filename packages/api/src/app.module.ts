import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProgramsModule } from './programs/programs.module';
import { TopicsModule } from './topics/topics.module';
import { TermsModule } from './terms/terms.module';
import { LessonsModule } from './lessons/lessons.module';
import { CatalogModule } from './catalog/catalog.module';
import { AssetsModule } from './assets/assets.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    ProgramsModule,
    TopicsModule,
    TermsModule,
    LessonsModule,
    CatalogModule,
    AssetsModule,
  ],
})
export class AppModule {}