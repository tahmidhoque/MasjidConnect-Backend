import { PrismaClient, ScreenStatus, ScreenOrientation } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  try {
    // Get the first masjid from the database
    const masjid = await prisma.masjid.findFirst();
    
    if (!masjid) {
      console.error('No masjid found in the database. Please create a masjid first.');
      return;
    }
    
    console.log(`Creating dummy screens for masjid: ${masjid.name} (${masjid.id})`);
    
    // Create some dummy screens
    const screens = [
      {
        name: 'Main Prayer Hall',
        status: ScreenStatus.ONLINE,
        location: 'Prayer Hall',
        orientation: ScreenOrientation.LANDSCAPE,
        lastSeen: new Date(),
      },
      {
        name: 'Entrance Display',
        status: ScreenStatus.ONLINE,
        location: 'Main Entrance',
        orientation: ScreenOrientation.PORTRAIT,
        lastSeen: new Date(),
      },
      {
        name: 'Community Room',
        status: ScreenStatus.OFFLINE,
        location: 'Community Room',
        orientation: ScreenOrientation.LANDSCAPE,
        lastSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        name: 'Women\'s Section',
        status: ScreenStatus.ONLINE,
        location: 'Women\'s Prayer Area',
        orientation: ScreenOrientation.LANDSCAPE,
        lastSeen: new Date(),
      },
    ];
    
    // Create each screen
    for (const screenData of screens) {
      const apiKey = randomBytes(32).toString('hex');
      
      const screen = await prisma.screen.create({
        data: {
          ...screenData,
          masjidId: masjid.id,
          apiKey,
          isActive: true,
        },
      });
      
      console.log(`Created screen: ${screen.name} (${screen.id})`);
    }
    
    console.log('Dummy screens created successfully!');
  } catch (error) {
    console.error('Error creating dummy screens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 