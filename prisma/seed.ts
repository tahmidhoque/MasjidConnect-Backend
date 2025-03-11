import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { randomBytes } from 'crypto'

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
      fajr: '05:00',
      fajrJamaat: '05:30',
      sunrise: '06:30',
      zuhr: '13:00',
      zuhrJamaat: '13:30',
      asr: '16:00',
      asrJamaat: '16:30',
      maghrib: '19:00',
      maghribJamaat: '19:15',
      isha: '20:30',
      ishaJamaat: '21:00',
      jummahKhutbah: '13:00',
      jummahJamaat: '13:30',
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

  // Create display screens
  const screens = await Promise.all([
    prisma.screen.create({
      data: {
        masjidId: masjid.id,
        name: 'Main Prayer Hall Screen',
        apiKey: randomBytes(32).toString('hex'),
        status: 'OFFLINE',
        location: 'Main Prayer Hall',
        orientation: 'LANDSCAPE',
        contentConfig: {
          showPrayerTimes: true,
          showAnnouncements: true,
          showHadith: true,
          refreshInterval: 60,
        },
      },
    }),
    prisma.screen.create({
      data: {
        masjidId: masjid.id,
        name: 'Entrance Display',
        apiKey: randomBytes(32).toString('hex'),
        status: 'OFFLINE',
        location: 'Main Entrance',
        orientation: 'PORTRAIT',
        contentConfig: {
          showPrayerTimes: true,
          showAnnouncements: true,
          showHadith: false,
          refreshInterval: 30,
        },
      },
    }),
  ])

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