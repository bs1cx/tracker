# Life Tracker

A personal life tracking web application built with Next.js 14+, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Daily Habits**: Track recurring habits that reset daily or weekly
- **One-Time Tasks**: Manage your to-do list with completion tracking
- **Progress Trackers**: Monitor ongoing progress like TV series episodes, books, etc.
- **Real-time Updates**: Built with Supabase for real-time data synchronization
- **Mobile Responsive**: Optimized for all device sizes

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Validation**: Zod
- **Deployment**: Vercel-ready

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the SQL from `supabase-schema.sql`
3. Get your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses three main tables:

- **profiles**: User profile information
- **trackables**: Main table for habits, tasks, and progress items
- **logs**: History of all completions and updates

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Project Structure

```
├── app/
│   ├── actions.ts          # Server actions for mutations
│   ├── page.tsx            # Main dashboard
│   ├── layout.tsx          # Root layout
│   └── auth/
│       └── page.tsx        # Authentication page
├── components/
│   ├── providers/          # Context providers
│   ├── trackables/         # Trackable-specific components
│   └── ui/                 # Shadcn/ui components
├── lib/
│   ├── supabase/           # Supabase client utilities
│   ├── validations.ts      # Zod schemas
│   └── utils.ts            # Utility functions
├── types/
│   └── database.ts         # TypeScript types
└── supabase-schema.sql     # Database schema
```

## Deployment

### Deploy to Vercel

This project is fully configured for Vercel deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Steps:**
1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

The app is optimized for Vercel's serverless functions and edge runtime. All necessary configuration files (`vercel.json`, `.vercelignore`) are included.

## License

MIT

