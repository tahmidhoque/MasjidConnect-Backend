import { prisma } from '@/lib/prisma';
import { 
  CreateContentScheduleDTO, 
  UpdateContentScheduleDTO,
  ContentScheduleType
} from '@/types/content-schedule';
import { Prisma } from '@prisma/client';

/**
 * Service responsible for managing content schedules
 */
export class ContentScheduleService {
  /**
   * Retrieves all content schedules for a masjid
   * @param masjidId The ID of the masjid
   * @returns List of content schedules with their items
   */
  static async getSchedules(masjidId: string): Promise<ContentScheduleType[]> {
    // Using Prisma client with type assertion to handle the new model
    return await (prisma as any).contentSchedule.findMany({
      where: { masjidId },
      include: {
        items: {
          include: {
            contentItem: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
  }

  /**
   * Creates a new content schedule
   * @param masjidId The ID of the masjid
   * @param data The schedule data
   * @returns The created schedule
   */
  static async createSchedule(
    masjidId: string, 
    data: CreateContentScheduleDTO
  ): Promise<ContentScheduleType> {
    const { name, description, isActive = true, slides = [] } = data;

    // Check if this is the first schedule for the masjid
    const existingSchedulesCount = await (prisma as any).contentSchedule.count({
      where: { masjidId }
    });

    // Create the schedule data object
    const createData = {
      masjidId,
      name,
      description,
      isActive,
      isDefault: existingSchedulesCount === 0, // Make it default if it's the first schedule
    };

    // Check if the slides contain valid content item IDs or placeholders
    const hasPlaceholders = slides.some(slide => 
      slide.id.startsWith('placeholder') || !slide.id.match(/^[0-9a-f]{24}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    );

    // If we have placeholders or no slides at all, create a schedule without items
    if (hasPlaceholders || slides.length === 0) {
      return await (prisma as any).contentSchedule.create({
        data: createData,
        include: {
          items: {
            include: {
              contentItem: true
            },
            orderBy: {
              order: 'asc'
            }
          }
        }
      });
    } else {
      // Only add items if we have real content item IDs
      return await (prisma as any).contentSchedule.create({
        data: {
          ...createData,
          items: {
            create: slides.map((slide, index) => ({
              contentItemId: slide.id,
              order: index
            }))
          }
        },
        include: {
          items: {
            include: {
              contentItem: true
            },
            orderBy: {
              order: 'asc'
            }
          }
        }
      });
    }
  }

  /**
   * Deletes a content schedule
   * @param masjidId The ID of the masjid
   * @param scheduleId The ID of the schedule to delete
   * @returns True if deletion was successful
   */
  static async deleteSchedule(masjidId: string, scheduleId: string): Promise<boolean> {
    // Get the schedule
    const schedule = await (prisma as any).contentSchedule.findFirst({
      where: {
        id: scheduleId,
        masjidId
      }
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    // Check if this is the last schedule
    const scheduleCount = await (prisma as any).contentSchedule.count({
      where: { masjidId }
    });

    if (scheduleCount <= 1) {
      throw new Error('Cannot delete the last schedule');
    }

    // Check if this is the default schedule
    if (schedule.isDefault) {
      throw new Error('Cannot delete the default schedule');
    }

    // Delete the schedule and its items
    await (prisma as any).contentSchedule.delete({
      where: {
        id: scheduleId
      }
    });

    return true;
  }

  /**
   * Toggles a schedule's active status
   * @param masjidId The ID of the masjid
   * @param scheduleId The ID of the schedule
   * @param isActive The new active status
   * @returns The updated schedule
   */
  static async toggleActive(
    masjidId: string,
    scheduleId: string,
    isActive: boolean
  ): Promise<ContentScheduleType> {
    // Get the schedule
    const schedule = await (prisma as any).contentSchedule.findFirst({
      where: {
        id: scheduleId,
        masjidId
      }
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    // Cannot deactivate default schedule
    if (schedule.isDefault && !isActive) {
      throw new Error('Cannot deactivate default schedule');
    }

    // Update the schedule
    return await (prisma as any).contentSchedule.update({
      where: {
        id: scheduleId
      },
      data: {
        isActive
      },
      include: {
        items: {
          include: {
            contentItem: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
  }

  /**
   * Sets a schedule as the default
   * @param masjidId The ID of the masjid
   * @param scheduleId The ID of the schedule
   * @returns The updated schedule
   */
  static async setDefault(
    masjidId: string,
    scheduleId: string
  ): Promise<ContentScheduleType> {
    try {
      return await (prisma as any).$transaction(async (tx: any) => {
        // Get the schedule and verify it exists
        const schedule = await tx.contentSchedule.findFirst({
          where: {
            id: scheduleId,
            masjidId
          }
        });

        if (!schedule) {
          throw new Error('Schedule not found');
        }

        // If it's already the default, just return it with items
        if (schedule.isDefault) {
          return await tx.contentSchedule.findFirst({
            where: { id: scheduleId },
            include: {
              items: {
                include: {
                  contentItem: true
                },
                orderBy: {
                  order: 'asc'
                }
              }
            }
          });
        }

        // Use a single raw query to handle both operations
        await tx.$executeRawUnsafe(
          `WITH updated_old AS (
            UPDATE "ContentSchedule"
            SET "isDefault" = false
            WHERE "masjidId" = $1 AND "isDefault" = true
          )
          UPDATE "ContentSchedule"
          SET "isDefault" = true, "isActive" = true
          WHERE "id" = $2`,
          masjidId,
          scheduleId
        );

        // Return the complete schedule with items
        return await tx.contentSchedule.findFirst({
          where: { id: scheduleId },
          include: {
            items: {
              include: {
                contentItem: true
              },
              orderBy: {
                order: 'asc'
              }
            }
          }
        });
      });
    } catch (error) {
      console.error('Error in setDefault:', error);
      throw error;
    }
  }

  /**
   * Duplicates a schedule
   * @param masjidId The ID of the masjid
   * @param sourceScheduleId The ID of the source schedule
   * @param name The name for the duplicated schedule
   * @returns The duplicated schedule
   */
  static async duplicateSchedule(
    masjidId: string,
    sourceScheduleId: string,
    name: string
  ): Promise<ContentScheduleType> {
    // Get the source schedule with its items
    const sourceSchedule = await (prisma as any).contentSchedule.findFirst({
      where: {
        id: sourceScheduleId,
        masjidId
      },
      include: {
        items: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!sourceSchedule) {
      throw new Error('Source schedule not found');
    }

    // Create new schedule with copied items
    return await (prisma as any).contentSchedule.create({
      data: {
        masjidId,
        name,
        description: sourceSchedule.description,
        isActive: true,
        isDefault: false,
        items: {
          create: sourceSchedule.items.map((item: any) => ({
            contentItemId: item.contentItemId,
            order: item.order
          }))
        }
      },
      include: {
        items: {
          include: {
            contentItem: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
  }

  /**
   * Updates an existing content schedule
   * @param masjidId The ID of the masjid
   * @param scheduleId The ID of the schedule to update
   * @param data The updated schedule data
   * @returns The updated schedule
   */
  static async updateSchedule(
    masjidId: string,
    scheduleId: string,
    data: UpdateContentScheduleDTO
  ): Promise<ContentScheduleType> {
    // Get the existing schedule
    const existingSchedule = await (prisma as any).contentSchedule.findFirst({
      where: {
        id: scheduleId,
        masjidId
      },
      include: {
        items: true
      }
    });

    if (!existingSchedule) {
      throw new Error('Schedule not found');
    }

    // Prepare data for update
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Start a transaction for the update
    return await prisma.$transaction(async (tx) => {
      // First update the basic schedule data
      const updatedSchedule = await (tx as any).contentSchedule.update({
        where: { id: scheduleId },
        data: updateData,
      });

      // If slides are provided and valid, update the items
      if (data.slides && data.slides.length > 0) {
        // Check if the slides contain placeholders
        const hasPlaceholders = data.slides.some(slide => 
          slide.id.startsWith('placeholder') || !slide.id.match(/^[0-9a-f]{24}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
        );

        if (!hasPlaceholders) {
          // Delete existing items
          await (tx as any).contentScheduleItem.deleteMany({
            where: { scheduleId }
          });

          // Create new items
          await Promise.all(data.slides.map(async (slide, index) => {
            await (tx as any).contentScheduleItem.create({
              data: {
                scheduleId,
                contentItemId: slide.id,
                order: index
              }
            });
          }));
        }
      }

      // Return the updated schedule with items
      return await (tx as any).contentSchedule.findFirst({
        where: { id: scheduleId },
        include: {
          items: {
            include: {
              contentItem: true
            },
            orderBy: {
              order: 'asc'
            }
          }
        }
      });
    });
  }
} 