# Setup Instructions

## Database Setup

Before using the authentication and card saving features, you need to set up the database table in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `supabase_migration.sql`

This will create:
- A `user_cards` table to store user's saved cards
- Row Level Security (RLS) policies to ensure users can only access their own cards
- An index for faster queries

## Environment Variables

Make sure you have the following environment variables set in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features

### Authentication
- Users can register for a new account
- Users can log in to their account
- Users can log out from the Settings page

### Card Management
- When logged in: Cards are saved to the database and persist across sessions
- When not logged in: Cards are saved to cookies (local only, cleared when cookies are cleared)
- Cards are automatically loaded when you visit the Settings or Play pages

### Navigation
- Login button available on the main page and play page
- Login/Logout button available in Settings page
- Warning message in Settings when not logged in

