
import { PrismaClient } from '@prisma/client';

// Transaction client type - use any since Prisma doesn't export this type directly
type TransactionClient = any;

export class PublishingWorker {
  constructor(private prisma: PrismaClient) {}

  /**
   * Process all scheduled lessons that are ready to be published
   * Idempotent and concurrency-safe
   */
  async processScheduledLessons() {
    const now = new Date();
    const publishedLessons: any[] = [];

    try {
      const scheduledLessons = await this.prisma.lesson.findMany({
        where: {
          status: 'SCHEDULED',
          publishAt: {
            lte: now,
          },
        },
        include: {
          term: {
            include: {
              program: true,
            },
          },
        },
        orderBy: {
          publishAt: 'asc',
        },
      });

      for (const lesson of scheduledLessons) {
        try {
          await this.prisma.$transaction(
            async (tx: TransactionClient) => {
              // Re-check with condition to ensure idempotency
              const lockedLesson = await tx.lesson.findFirst({
                where: {
                  id: lesson.id,
                  status: 'SCHEDULED',
                  publishAt: {
                    lte: now,
                  },
                },
                include: {
                  term: true,
                },
              });

              if (!lockedLesson) return;

              await this.validateLessonForPublishing(tx, lesson.id);

              const updatedLesson = await tx.lesson.update({
                where: { id: lesson.id },
                data: {
                  status: 'PUBLISHED',
                  publishedAt: now,
                  publishAt: null,
                },
              });

              publishedLessons.push(updatedLesson);

              await this.autoPublishProgram(tx, lockedLesson.term.programId);
            }
          );

          console.log(`✅ Published lesson: ${lesson.title} (${lesson.id})`);
        } catch (error) {
          if (error instanceof Error) {
            console.error(
              `❌ Failed to publish lesson ${lesson.id}:`,
              error.message
            );
          } else {
            console.error(
              `❌ Failed to publish lesson ${lesson.id}:`,
              error
            );
          }
        }
      }

      return publishedLessons;
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ Error processing scheduled lessons:', error.message);
      } else {
        console.error('❌ Error processing scheduled lessons:', error);
      }
      throw error;
    }
  }

  /**
   * Validate lesson before publishing
   */
  private async validateLessonForPublishing(
    tx: TransactionClient,
    lessonId: string
  ): Promise<void> {
    const lesson = await tx.lesson.findUnique({
      where: { id: lessonId },
      include: {
        assets: true,
      },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const requiredAssets = lesson.assets.filter(
      (asset: any) =>
        asset.language === lesson.contentLanguagePrimary &&
        asset.assetType === 'thumbnail' &&
        (asset.variant === 'PORTRAIT' || asset.variant === 'LANDSCAPE')
    );

    if (requiredAssets.length < 2) {
      throw new Error(
        `Lesson ${lesson.title} missing required thumbnails for publishing`
      );
    }

    const primaryUrl =
      lesson.contentUrlsByLanguage[
        lesson.contentLanguagePrimary as keyof typeof lesson.contentUrlsByLanguage
      ];

    if (!primaryUrl) {
      throw new Error(
        `Lesson ${lesson.title} missing content URL for primary language`
      );
    }
  }

  /**
   * Auto-publish program if eligible
   */
  private async autoPublishProgram(
    tx: TransactionClient,
    programId: string
  ): Promise<void> {
    const program = await tx.program.findUnique({
      where: { id: programId },
      include: {
        assets: true,
      },
    });

    if (!program || program.status === 'PUBLISHED') return;

    const publishedLessonsCount = await tx.lesson.count({
      where: {
        term: {
          programId,
        },
        status: 'PUBLISHED',
      },
    });

    if (publishedLessonsCount === 0) return;

    const requiredAssets = program.assets.filter(
      (asset: any) =>
        asset.language === program.languagePrimary &&
        asset.assetType === 'poster' &&
        (asset.variant === 'PORTRAIT' || asset.variant === 'LANDSCAPE')
    );

    if (requiredAssets.length < 2) {
      console.warn(
        `⚠️ Program ${program.title} missing required poster assets`
      );
      return;
    }

    await tx.program.update({
      where: { id: programId },
      data: {
        status: 'PUBLISHED',
        publishedAt: program.publishedAt ?? new Date(),
      },
    });

    console.log(`✅ Auto-published program: ${program.title} (${programId})`);
  }
}
