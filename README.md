# Job Board Backend - Manual Setup Guide

This guide will help you set up the Job Board backend manually without Docker.

## Prerequisites

Before starting, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v13 or higher)
- **Yarn** or **npm**
- **Git**

## Step 1: Install Dependencies

```bash
# Navigate to the backend directory
cd job-portal

# Install dependencies
yarn install
# or
npm install
```

## Step 2: Database Setup

### Install PostgreSQL

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS (with Homebrew):**

```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE jobboard_db;
CREATE USER jobboard_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE jobboard_db TO jobboard_user;

# Exit PostgreSQL
\q
```

## Step 3: Environment Configuration

```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your configuration
nano .env
```

Update the following variables in your `.env` file:

```env
DATABASE_URL="postgresql://jobboard_user:your_password@localhost:5432/jobboard_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
```

## Step 4: Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

## Step 5: Start the Development Server

```bash
# Start the development server
yarn dev
# or
npm run dev
```

The API will be available at `http://localhost:5000`

## Step 6: Verify Installation

### Test the API endpoints:

```bash
# Health check
curl http://localhost:5000/api/v1/health

# Test authentication
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "jobSeeker",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890",
    "bio": "Test user bio"
  }'
```

## Available Scripts

- `yarn dev` - Start development server with hot reload
- `yarn build` - Build the application for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint errors
- `yarn prettier:check` - Check code formatting
- `yarn prettier:fix` - Fix code formatting

## Database Management

### Prisma Commands:

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (WARNING: This will delete all data)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy

# Generate Prisma client after schema changes
npx prisma generate
```

## Troubleshooting

### Common Issues:

1. **Database Connection Error:**

   - Check if PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **Port Already in Use:**

   - Change the PORT in `.env` file
   - Kill the process using the port: `lsof -ti:5000 | xargs kill -9`

3. **Prisma Client Error:**

   - Run `npx prisma generate`
   - Check if database schema is up to date

4. **Permission Denied:**
   - Check file permissions
   - Ensure PostgreSQL user has proper permissions

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in `.env`
2. Use strong, unique JWT secrets
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Use a process manager like PM2
6. Set up monitoring and logging

## API Documentation

Once the server is running, you can access:

- **API Base URL:** `http://localhost:5000/api/v1`
- **Health Check:** `GET /api/v1/health`
- **Auth Endpoints:** `POST /api/v1/auth/login`, `POST /api/v1/auth/register`
- **User Endpoints:** `GET /api/v1/user/me`

## Support

If you encounter any issues, check:

1. All prerequisites are installed
2. Database is running and accessible
3. Environment variables are correctly set
4. All dependencies are installed
5. Port 5000 is available
