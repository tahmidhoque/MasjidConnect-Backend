import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create a test mosque
  const masjid = await prisma.masjid.create({
    data: {
      name: 'Central Mosque',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 'Europe/London',
      calculationMethod: 'MWL',
      madhab: 'Hanafi',
    },
  })

  // Create an admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
      masjidId: masjid.id,
    },
  })

  // Create a regular user
  const userPassword = await hash('user123', 12)
  const user = await prisma.user.create({
    data: {
      name: 'Regular User',
      email: 'user@example.com',
      password: userPassword,
      role: 'USER',
      masjidId: masjid.id,
    },
  })

  // Create some prayer times
  const today = new Date()
  const prayerTimes = await prisma.prayerTime.create({
    data: {
      masjidId: masjid.id,
      date: today,
      fajr: new Date(today.setHours(5, 0)),
      fajrJamaat: new Date(today.setHours(5, 30)),
      sunrise: new Date(today.setHours(6, 30)),
      zuhr: new Date(today.setHours(13, 0)),
      zuhrJamaat: new Date(today.setHours(13, 30)),
      asr: new Date(today.setHours(16, 0)),
      asrJamaat: new Date(today.setHours(16, 30)),
      maghrib: new Date(today.setHours(19, 0)),
      maghribJamaat: new Date(today.setHours(19, 15)),
      isha: new Date(today.setHours(20, 30)),
      ishaJamaat: new Date(today.setHours(21, 0)),
      jummahKhutbah: new Date(today.setHours(13, 0)),
      jummahJamaat: new Date(today.setHours(13, 30)),
    },
  })

  // Create some hadiths
  const hadith = await prisma.hadith.create({
    data: {
      masjidId: masjid.id,
      arabicText: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
      englishText: 'Actions are but by intentions',
      displayDate: new Date(),
      isActive: true,
    },
  })

  // Create some announcements
  const announcement = await prisma.announcement.create({
    data: {
      masjidId: masjid.id,
      message: 'Welcome to our new digital display system!',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      isActive: true,
    },
  })

  // Create a display screen
  const screen = await prisma.screen.create({
    data: {
      masjidId: masjid.id,
      name: 'Main Prayer Hall Screen',
      apiKey: 'test-api-key-123',
      isActive: true,
    },
  })

  console.log('Seed data created successfully!')
  console.log('Admin credentials:')
  console.log('Email: admin@example.com')
  console.log('Password: admin123')
  console.log('\nUser credentials:')
  console.log('Email: user@example.com')
  console.log('Password: user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 