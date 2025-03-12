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

    return await (prisma as any).contentSchedule.create({
      data: {
        masjidId,
        name,
        description,
        isActive,
        isDefault: existingSchedulesCount === 0, // Make it default if it's the first schedule
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

    // Start a transaction to update both schedules
    return await prisma.$transaction(async (tx) => {
      // Remove default from current default schedule
      await (tx as any).contentSchedule.updateMany({
        where: {
          masjidId,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      });

      // Set new default schedule and ensure it's active
      return await (tx as any).contentSchedule.update({
        where: {
          id: scheduleId
        },
        data: {
          isDefault: true,
          isActive: true
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
    });
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
} 