// Directly update a schedule with content items
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSchedule() {
  try {
    const scheduleId = 'cm86g2ndq000dsb3ybjasqw0e';
    const contentItemIds = [
      'cm89473eb0001sb27qco1hro7',
      'cm8879uo1000bsb5g2wyrp5wc',
      'cm88qpobj0003sbyynzv5zcxk'
    ];
    
    console.log(`Updating schedule ${scheduleId} with content items:`, contentItemIds);
    
    // First, delete existing items
    const deleteResult = await prisma.contentScheduleItem.deleteMany({
      where: { scheduleId }
    });
    
    console.log('Deleted existing items:', deleteResult);
    
    // Create new items
    const items = [];
    for (let i = 0; i < contentItemIds.length; i++) {
      const contentItemId = contentItemIds[i];
      
      try {
        const item = await prisma.contentScheduleItem.create({
          data: {
            scheduleId,
            contentItemId,
            order: i
          }
        });
        
        items.push(item);
        console.log(`Created item with order ${i}:`, item);
      } catch (error) {
        console.error(`Error creating item for content item ${contentItemId}:`, error);
      }
    }
    
    console.log('Created items:', items.length);
    
    // Verify the items were created
    const schedule = await prisma.contentSchedule.findUnique({
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
    
    if (schedule) {
      console.log(`Schedule found: ${schedule.name}`);
      console.log(`Items: ${schedule.items.length}`);
      
      if (schedule.items.length > 0) {
        console.log('Items:');
        schedule.items.forEach(item => {
          console.log(`- Order ${item.order}: ${item.contentItemId} -> ${item.contentItem ? item.contentItem.title : 'NOT FOUND'}`);
        });
      } else {
        console.log('No items in this schedule');
      }
    } else {
      console.log(`Schedule with ID ${scheduleId} not found`);
    }
  } catch (error) {
    console.error('Error updating schedule:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSchedule(); 