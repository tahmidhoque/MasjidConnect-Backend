# Masjid Admin Dashboard

A modern admin dashboard for managing masjid (mosque) operations, built with Next.js 14, TypeScript, and Material UI.

## Features

- 🔐 Secure authentication with NextAuth.js
- 🎨 Modern UI with Material UI components
- 🚀 Server-side rendering with Next.js 14
- 📱 Responsive design for all devices
- 🔄 Real-time data updates
- 🛡️ TypeScript for type safety
- 🎯 Clean and maintainable code structure

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/masjid-admin.git
cd masjid-admin
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your configuration.

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/              # Next.js app directory
│   ├── api/         # API routes
│   ├── dashboard/   # Dashboard pages
│   └── login/       # Authentication pages
├── components/       # Reusable components
├── lib/             # Utility functions
└── types/           # TypeScript type definitions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## TODO

- Review and strengthen ESLint configurations: Some ESLint rules have been temporarily relaxed for production deployment. These should be revisited and properly addressed in future updates.
- Address unused variables and improve error handling across components
- Fix React Hook usage in dashboard layout
- Implement proper error logging strategy
