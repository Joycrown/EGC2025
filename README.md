# EGC Conference App
A comprehensive conference management platform for EGC events with features for member registration, team assignment, ID card generation, and virtual games coordination.

## Project Overview
- **Frontend & Backend**: Next.js with App Router
- **Database**: PostgreSQL
- **Real-time Communication**: Socket.io
- **Styling**: TailwindCSS
  
## Getting Started


### Environment Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Update the environment variables in the `.env` file

### Database Setup

1. Make sure PostgreSQL is installed and running
2. Create a database for the project
3. Update the `DATABASE_URL` in your `.env` file
4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

### Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
egc-conference-app/
├── src/
│   ├── app/                  # Next.js App Router
│   ├── components/           # React components
│   ├── lib/                  # Utility libraries
│   ├── api/                  # API handlers 
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions
│   └── styles/               # Global styles
├── public/                   # Static assets
├── prisma/                   # Database schema & migrations
└── ...config files
```
## Key Features
- User registration system with team assignment based on birth month
- Digital ID card generation
- Team management and group chat integration
- Interactive games with real-time functionality
- Conference dashboard with countdown timer and schedule
- Real-time team standings and statistics

## Development Workflow

1. Create a new branch for each feature
2. Follow ESLint and Prettier standards
3. Write tests for critical functionality
4. Submit pull requests for review

## Environment Variables

See `.env.example` for all required environment variables.

## License

This project is proprietary and confidential....
